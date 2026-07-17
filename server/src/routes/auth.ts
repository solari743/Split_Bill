import { OAuth2Client } from "google-auth-library";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { AuthProvider } from "@prisma/client";
import { env } from "../env.js";
import { prisma } from "../prisma.js";
import {
  createRefreshToken,
  hashPassword,
  hashRefreshToken,
  persistRefreshSession,
  verifyPassword
} from "../utils/security.js";
import { serializeUser } from "../utils/serialize.js";
import { normalizePhone } from "../utils/phone.js";

const emailPasswordSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(120).optional(),
  phone: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const googleSchema = z.object({
  idToken: z.string().min(1)
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1)
});

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function issueTokens(app: FastifyInstance, user: { id: string; email: string }) {
  const accessToken = app.jwt.sign(
    { sub: user.id, email: user.email },
    { expiresIn: "15m" }
  );
  const refreshToken = createRefreshToken();
  await persistRefreshSession(user.id, refreshToken);
  return { accessToken, refreshToken };
}

export async function authRoutes(app: FastifyInstance) {
  const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

  app.post("/auth/register", async (request, reply) => {
    const parsed = emailPasswordSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ message: "Invalid registration details.", issues: parsed.error.flatten() });
    }

    const email = normalizeEmail(parsed.data.email);
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return reply.code(409).send({ message: "An account with this email already exists." });
    }

    const user = await prisma.user.create({
      data: {
        email,
        name: parsed.data.name?.trim() || null,
        phone: normalizePhone(parsed.data.phone),
        passwordHash: await hashPassword(parsed.data.password),
        identities: {
          create: {
            provider: AuthProvider.EMAIL,
            providerUserId: email
          }
        }
      }
    });
    const tokens = await issueTokens(app, user);
    return reply.code(201).send({ user: serializeUser(user), ...tokens });
  });

  app.post("/auth/login", async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ message: "Invalid login details.", issues: parsed.error.flatten() });
    }

    const email = normalizeEmail(parsed.data.email);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user?.passwordHash || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
      return reply.code(401).send({ message: "Invalid email or password." });
    }

    const tokens = await issueTokens(app, user);
    return { user: serializeUser(user), ...tokens };
  });

  app.post("/auth/google", async (request, reply) => {
    if (!env.GOOGLE_CLIENT_ID) {
      return reply.code(400).send({ message: "Google auth is not configured on this server." });
    }

    const parsed = googleSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ message: "Invalid Google token.", issues: parsed.error.flatten() });
    }

    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: parsed.data.idToken,
        audience: env.GOOGLE_CLIENT_ID
      });
      const payload = ticket.getPayload();
      if (!payload?.sub || !payload.email) {
        return reply.code(401).send({ message: "Google token did not include an account identity." });
      }

      const email = normalizeEmail(payload.email);
      const identity = await prisma.authIdentity.findUnique({
        where: {
          provider_providerUserId: {
            provider: AuthProvider.GOOGLE,
            providerUserId: payload.sub
          }
        },
        include: { user: true }
      });

      const user = identity?.user ?? await prisma.user.upsert({
        where: { email },
        update: {
          name: payload.name ?? undefined,
          identities: {
            connectOrCreate: {
              where: {
                provider_providerUserId: {
                  provider: AuthProvider.GOOGLE,
                  providerUserId: payload.sub
                }
              },
              create: {
                provider: AuthProvider.GOOGLE,
                providerUserId: payload.sub
              }
            }
          }
        },
        create: {
          email,
          name: payload.name ?? null,
          identities: {
            create: {
              provider: AuthProvider.GOOGLE,
              providerUserId: payload.sub
            }
          }
        }
      });

      const tokens = await issueTokens(app, user);
      return { user: serializeUser(user), ...tokens };
    } catch {
      return reply.code(401).send({ message: "Google sign-in failed." });
    }
  });

  app.post("/auth/refresh", async (request, reply) => {
    const parsed = refreshSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ message: "Invalid refresh request.", issues: parsed.error.flatten() });
    }

    const tokenHash = hashRefreshToken(parsed.data.refreshToken);
    const session = await prisma.refreshSession.findUnique({
      where: { tokenHash },
      include: { user: true }
    });

    if (!session || session.revokedAt || session.expiresAt <= new Date()) {
      return reply.code(401).send({ message: "Refresh token is invalid or expired." });
    }

    await prisma.refreshSession.update({
      where: { id: session.id },
      data: { revokedAt: new Date() }
    });
    const tokens = await issueTokens(app, session.user);
    return { user: serializeUser(session.user), ...tokens };
  });

  app.post("/auth/logout", { preHandler: [app.authenticate] }, async (request) => {
    const parsed = refreshSchema.safeParse(request.body);
    if (parsed.success) {
      await prisma.refreshSession.updateMany({
        where: {
          tokenHash: hashRefreshToken(parsed.data.refreshToken),
          userId: request.user.sub,
          revokedAt: null
        },
        data: { revokedAt: new Date() }
      });
    }
    return { ok: true };
  });

  app.get("/auth/me", { preHandler: [app.authenticate] }, async (request, reply) => {
    const user = await prisma.user.findUnique({ where: { id: request.user.sub } });
    if (!user) {
      return reply.code(404).send({ message: "User not found." });
    }
    return { user: serializeUser(user) };
  });
}
