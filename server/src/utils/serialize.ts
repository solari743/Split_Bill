import type { Bill, BillItem, BillItemAssignment, BillParticipant, ReceiptDraft, ReceiptItemDraft, User } from "@prisma/client";
import { amountFromCents } from "./money.js";

export function serializeUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    createdAt: user.createdAt.toISOString()
  };
}

export function serializeReceiptDraft(draft: ReceiptDraft & { items: ReceiptItemDraft[] }) {
  return {
    id: draft.id,
    merchant: draft.merchant,
    receiptDate: draft.receiptDate?.toISOString() ?? null,
    subtotal: amountFromCents(draft.subtotalCents),
    tax: amountFromCents(draft.taxCents),
    tip: amountFromCents(draft.tipCents),
    fees: amountFromCents(draft.feesCents),
    total: amountFromCents(draft.totalCents),
    confidence: draft.confidence,
    rawText: draft.rawText,
    confirmedAt: draft.confirmedAt?.toISOString() ?? null,
    items: draft.items.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      unit: amountFromCents(item.unitCents),
      total: amountFromCents(item.totalCents)
    }))
  };
}

type BillWithRelations = Bill & {
  items: Array<BillItem & { assignments: BillItemAssignment[] }>;
  participants: BillParticipant[];
};

export function serializeBill(bill: BillWithRelations) {
  return {
    id: bill.id,
    title: bill.title,
    splitMode: bill.splitMode.toLowerCase(),
    subtotal: amountFromCents(bill.subtotalCents),
    tax: amountFromCents(bill.taxCents),
    tip: amountFromCents(bill.tipCents),
    fees: amountFromCents(bill.feesCents),
    total: amountFromCents(bill.totalCents),
    createdAt: bill.createdAt.toISOString(),
    participants: bill.participants.map((participant) => ({
      id: participant.id,
      name: participant.name,
      phone: participant.phone,
      amount: amountFromCents(participant.amountCents),
      paid: amountFromCents(participant.paidCents),
      status: participant.status.toLowerCase()
    })),
    items: bill.items.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      total: amountFromCents(item.totalCents),
      assignments: item.assignments.map((assignment) => ({
        participantId: assignment.participantId,
        share: amountFromCents(assignment.shareCents)
      }))
    }))
  };
}
