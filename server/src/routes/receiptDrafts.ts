import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import type { FastifyInstance } from "fastify";
import type { MultipartFile } from "@fastify/multipart";
import { z } from "zod";
import { env } from "../env.js";
import { prisma } from "../prisma.js";
import { parseReceiptImage } from "../services/receiptParser.js";
import { centsFromAmount } from "../utils/money.js";
import { serializeReceiptDraft } from "../utils/serialize.js";

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);

const receiptItemInputSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(160),
  quantity: z.coerce.number().int().positive().default(1),
  unit: z.coerce.number().nonnegative(),
  total: z.coerce.number().nonnegative()
});

const updateReceiptSchema = z.object({
  merchant: z.string().min(1).max(160),
  receiptDate: z.string().datetime().nullable().optional(),
  subtotal: z.coerce.number().nonnegative(),
  tax: z.coerce.number().nonnegative().default(0),
  tip: z.coerce.number().nonnegative().default(0),
  fees: z.coerce.number().nonnegative().default(0),
  total: z.coerce.number().nonnegative(),
  items: z.array(receiptItemInputSchema).min(1)
});

async function saveUpload(part: MultipartFile) {
  if (!allowedMimeTypes.has(part.mimetype)) {
    throw new Error("Receipt image must be JPEG, PNG, WebP, HEIC, or HEIF.");
  }

  await fs.mkdir(env.UPLOAD_DIR, { recursive: true });
  const extension = path.extname(part.filename || "") || ".jpg";
  const filename = `${Date.now()}-${crypto.randomUUID()}${extension}`;
  const uploadPath = path.resolve(env.UPLOAD_DIR, filename);
  const chunks: Buffer[] = [];
  for await (const chunk of part.file) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  await fs.writeFile(uploadPath, Buffer.concat(chunks));
  return { uploadPath, mimeType: part.mimetype };
}

export async function receiptDraftRoutes(app: FastifyInstance) {
  app.post("/receipt-drafts", { preHandler: [app.authenticate] }, async (request, reply) => {
    try {
      const part = await request.file();
      if (!part) {
        return reply.code(400).send({ message: "Upload an image file using the field name `receipt`." });
      }
      const { uploadPath, mimeType } = await saveUpload(part);
      const parsed = await parseReceiptImage({
        imagePath: uploadPath,
        mimeType,
        providerApiKey: env.RECEIPT_PROVIDER_API_KEY
      });

      const draft = await prisma.receiptDraft.create({
        data: {
          userId: request.user.sub,
          merchant: parsed.merchant,
          receiptDate: parsed.receiptDate,
          subtotalCents: parsed.subtotalCents,
          taxCents: parsed.taxCents,
          tipCents: parsed.tipCents,
          feesCents: parsed.feesCents,
          totalCents: parsed.totalCents,
          confidence: parsed.confidence,
          rawText: parsed.rawText,
          imagePath: uploadPath,
          items: {
            create: parsed.items.map((item) => ({
              name: item.name,
              quantity: item.quantity,
              unitCents: item.unitCents,
              totalCents: item.totalCents
            }))
          }
        },
        include: { items: true }
      });

      return reply.code(201).send({ receiptDraft: serializeReceiptDraft(draft) });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Receipt upload failed.";
      return reply.code(400).send({ message });
    }
  });

  app.get("/receipt-drafts/:id", { preHandler: [app.authenticate] }, async (request, reply) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    const draft = await prisma.receiptDraft.findFirst({
      where: { id: params.id, userId: request.user.sub },
      include: { items: true }
    });
    if (!draft) {
      return reply.code(404).send({ message: "Receipt draft not found." });
    }
    return { receiptDraft: serializeReceiptDraft(draft) };
  });

  app.put("/receipt-drafts/:id", { preHandler: [app.authenticate] }, async (request, reply) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    const parsed = updateReceiptSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ message: "Invalid receipt draft.", issues: parsed.error.flatten() });
    }

    const existing = await prisma.receiptDraft.findFirst({
      where: { id: params.id, userId: request.user.sub }
    });
    if (!existing) {
      return reply.code(404).send({ message: "Receipt draft not found." });
    }

    const draft = await prisma.$transaction(async (tx) => {
      await tx.receiptItemDraft.deleteMany({ where: { receiptDraftId: existing.id } });
      return tx.receiptDraft.update({
        where: { id: existing.id },
        data: {
          merchant: parsed.data.merchant.trim(),
          receiptDate: parsed.data.receiptDate ? new Date(parsed.data.receiptDate) : null,
          subtotalCents: centsFromAmount(parsed.data.subtotal),
          taxCents: centsFromAmount(parsed.data.tax),
          tipCents: centsFromAmount(parsed.data.tip),
          feesCents: centsFromAmount(parsed.data.fees),
          totalCents: centsFromAmount(parsed.data.total),
          items: {
            create: parsed.data.items.map((item) => ({
              name: item.name.trim(),
              quantity: item.quantity,
              unitCents: centsFromAmount(item.unit),
              totalCents: centsFromAmount(item.total)
            }))
          }
        },
        include: { items: true }
      });
    });

    return { receiptDraft: serializeReceiptDraft(draft) };
  });
}
