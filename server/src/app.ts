import Fastify from "fastify";
import type { FastifyReply, FastifyRequest } from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import jwt from "@fastify/jwt";
import multipart from "@fastify/multipart";
import rateLimit from "@fastify/rate-limit";
import { corsOrigins, env } from "./env.js";
import { authRoutes } from "./routes/auth.js";
import { receiptDraftRoutes } from "./routes/receiptDrafts.js";
import { billRoutes } from "./routes/bills.js";
import { dashboardRoutes } from "./routes/dashboard.js";

export async function buildApp() {
  const app = Fastify({
    logger: env.NODE_ENV !== "test"
  });

  await app.register(helmet);
  await app.register(cors, {
    origin: (origin, callback) => {
      if (!origin || corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Origin not allowed"), false);
    },
    credentials: true
  });
  await app.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute"
  });
  await app.register(jwt, {
    secret: env.JWT_SECRET
  });
  await app.register(multipart, {
    limits: {
      fileSize: 8 * 1024 * 1024,
      files: 1
    }
  });

  app.decorate("authenticate", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch {
      reply.code(401).send({ message: "Authentication required." });
    }
  });

  app.get("/health", async () => ({ ok: true }));
  await app.register(authRoutes);
  await app.register(receiptDraftRoutes);
  await app.register(billRoutes);
  await app.register(dashboardRoutes);

  return app;
}
