import type { FastifyInstance } from "fastify";
import { PaymentStatus, SplitMode } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { allocateProportionally, splitCentsEvenly } from "../utils/money.js";
import { normalizePhone } from "../utils/phone.js";
import { serializeBill } from "../utils/serialize.js";

const participantSchema = z.object({
  clientId: z.string().min(1).max(80).optional(),
  name: z.string().min(1).max(120),
  phone: z.string().optional()
});

const createBillSchema = z.object({
  receiptDraftId: z.string().min(1),
  title: z.string().min(1).max(160).optional(),
  splitMode: z.enum(["even", "itemized"]),
  participants: z.array(participantSchema).min(1),
  itemAssignments: z.array(z.object({
    receiptItemId: z.string().min(1),
    participantClientIds: z.array(z.string().min(1)).min(1)
  })).optional()
});

const statusSchema = z.object({
  status: z.enum(["pending", "paid"]),
  amount: z.coerce.number().nonnegative().optional(),
  note: z.string().max(240).optional()
});

function participantKey(participant: z.infer<typeof participantSchema>, index: number) {
  return participant.clientId ?? `participant-${index}`;
}

async function getBillForUser(billId: string, userId: string) {
  return prisma.bill.findFirst({
    where: { id: billId, userId },
    include: {
      participants: { orderBy: { createdAt: "asc" } },
      items: {
        orderBy: { id: "asc" },
        include: { assignments: true }
      }
    }
  });
}

export async function billRoutes(app: FastifyInstance) {
  app.post("/bills", { preHandler: [app.authenticate] }, async (request, reply) => {
    const parsed = createBillSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ message: "Invalid bill details.", issues: parsed.error.flatten() });
    }

    const draft = await prisma.receiptDraft.findFirst({
      where: { id: parsed.data.receiptDraftId, userId: request.user.sub },
      include: { items: true, bill: true }
    });
    if (!draft) {
      return reply.code(404).send({ message: "Receipt draft not found." });
    }
    if (draft.bill) {
      return reply.code(409).send({ message: "This receipt draft is already attached to a bill." });
    }

    const participantInputs = parsed.data.participants.map((participant, index) => ({
      key: participantKey(participant, index),
      name: participant.name.trim(),
      phone: normalizePhone(participant.phone),
      amountCents: 0,
      itemSubtotalCents: 0
    }));
    const duplicateKeys = new Set<string>();
    const seenKeys = new Set<string>();
    for (const participant of participantInputs) {
      if (seenKeys.has(participant.key)) duplicateKeys.add(participant.key);
      seenKeys.add(participant.key);
    }
    if (duplicateKeys.size > 0) {
      return reply.code(400).send({ message: "Participant client IDs must be unique." });
    }

    const itemAssignmentPlan = new Map<string, Array<{ key: string; shareCents: number }>>();
    if (parsed.data.splitMode === "even") {
      const shares = splitCentsEvenly(draft.totalCents, participantInputs.length);
      participantInputs.forEach((participant, index) => {
        participant.amountCents = shares[index];
      });
    } else {
      const assignments = parsed.data.itemAssignments ?? [];
      const assignmentByItem = new Map(assignments.map((assignment) => [assignment.receiptItemId, assignment.participantClientIds]));
      for (const item of draft.items) {
        const keys = assignmentByItem.get(item.id);
        if (!keys?.length) {
          return reply.code(400).send({ message: `Item "${item.name}" must be assigned to at least one participant.` });
        }
        for (const key of keys) {
          if (!seenKeys.has(key)) {
            return reply.code(400).send({ message: `Unknown participant client ID "${key}".` });
          }
        }
        const itemShares = splitCentsEvenly(item.totalCents, keys.length);
        const plan = keys.map((key, index) => ({ key, shareCents: itemShares[index] }));
        itemAssignmentPlan.set(item.id, plan);
        for (const share of plan) {
          const participant = participantInputs.find((entry) => entry.key === share.key);
          if (participant) {
            participant.itemSubtotalCents += share.shareCents;
          }
        }
      }

      const extras = draft.taxCents + draft.tipCents + draft.feesCents;
      const extrasByParticipant = allocateProportionally(
        extras,
        participantInputs.map((participant) => participant.itemSubtotalCents)
      );
      participantInputs.forEach((participant, index) => {
        participant.amountCents = participant.itemSubtotalCents + extrasByParticipant[index];
      });
    }

    const bill = await prisma.$transaction(async (tx) => {
      const createdBill = await tx.bill.create({
        data: {
          userId: request.user.sub,
          receiptDraftId: draft.id,
          title: parsed.data.title?.trim() || draft.merchant,
          splitMode: parsed.data.splitMode === "even" ? SplitMode.EVEN : SplitMode.ITEMIZED,
          subtotalCents: draft.subtotalCents,
          taxCents: draft.taxCents,
          tipCents: draft.tipCents,
          feesCents: draft.feesCents,
          totalCents: draft.totalCents
        }
      });

      await tx.receiptDraft.update({
        where: { id: draft.id },
        data: { confirmedAt: new Date() }
      });

      const participantIdByKey = new Map<string, string>();
      for (const participant of participantInputs) {
        const created = await tx.billParticipant.create({
          data: {
            billId: createdBill.id,
            name: participant.name,
            phone: participant.phone,
            amountCents: participant.amountCents
          }
        });
        participantIdByKey.set(participant.key, created.id);
      }

      for (const draftItem of draft.items) {
        const createdItem = await tx.billItem.create({
          data: {
            billId: createdBill.id,
            receiptItemId: draftItem.id,
            name: draftItem.name,
            quantity: draftItem.quantity,
            totalCents: draftItem.totalCents
          }
        });

        const plan = itemAssignmentPlan.get(draftItem.id) ?? [];
        if (plan.length > 0) {
          await tx.billItemAssignment.createMany({
            data: plan.map((assignment) => ({
              billItemId: createdItem.id,
              participantId: participantIdByKey.get(assignment.key) ?? "",
              shareCents: assignment.shareCents
            }))
          });
        }
      }

      return tx.bill.findUniqueOrThrow({
        where: { id: createdBill.id },
        include: {
          participants: { orderBy: { createdAt: "asc" } },
          items: {
            include: { assignments: true }
          }
        }
      });
    });

    return reply.code(201).send({ bill: serializeBill(bill) });
  });

  app.get("/bills", { preHandler: [app.authenticate] }, async (request) => {
    const bills = await prisma.bill.findMany({
      where: { userId: request.user.sub },
      orderBy: { createdAt: "desc" },
      include: {
        participants: { orderBy: { createdAt: "asc" } },
        items: { include: { assignments: true } }
      }
    });
    return { bills: bills.map(serializeBill) };
  });

  app.get("/bills/:id", { preHandler: [app.authenticate] }, async (request, reply) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    const bill = await getBillForUser(params.id, request.user.sub);
    if (!bill) {
      return reply.code(404).send({ message: "Bill not found." });
    }
    return { bill: serializeBill(bill) };
  });

  app.patch("/bills/:billId/participants/:participantId/status", { preHandler: [app.authenticate] }, async (request, reply) => {
    const params = z.object({ billId: z.string(), participantId: z.string() }).parse(request.params);
    const parsed = statusSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ message: "Invalid payment status.", issues: parsed.error.flatten() });
    }

    const bill = await prisma.bill.findFirst({
      where: { id: params.billId, userId: request.user.sub },
      include: { participants: true }
    });
    const participant = bill?.participants.find((entry) => entry.id === params.participantId);
    if (!bill || !participant) {
      return reply.code(404).send({ message: "Bill participant not found." });
    }

    const paidCents = parsed.data.status === "paid"
      ? Math.min(Math.round((parsed.data.amount ?? participant.amountCents / 100) * 100), participant.amountCents)
      : 0;

    const updated = await prisma.$transaction(async (tx) => {
      await tx.billParticipant.update({
        where: { id: participant.id },
        data: {
          status: parsed.data.status === "paid" ? PaymentStatus.PAID : PaymentStatus.PENDING,
          paidCents
        }
      });
      await tx.paymentStatusEvent.create({
        data: {
          billId: bill.id,
          participantId: participant.id,
          status: parsed.data.status === "paid" ? PaymentStatus.PAID : PaymentStatus.PENDING,
          amountCents: paidCents,
          note: parsed.data.note?.trim() || null
        }
      });
      return tx.bill.findUniqueOrThrow({
        where: { id: bill.id },
        include: {
          participants: { orderBy: { createdAt: "asc" } },
          items: { include: { assignments: true } }
        }
      });
    });

    return { bill: serializeBill(updated) };
  });
}
