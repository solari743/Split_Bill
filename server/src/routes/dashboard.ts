import type { FastifyInstance } from "fastify";
import { PaymentStatus } from "@prisma/client";
import { prisma } from "../prisma.js";
import { amountFromCents } from "../utils/money.js";

export async function dashboardRoutes(app: FastifyInstance) {
  app.get("/dashboard", { preHandler: [app.authenticate] }, async (request) => {
    const bills = await prisma.bill.findMany({
      where: { userId: request.user.sub },
      orderBy: { createdAt: "desc" },
      include: {
        participants: {
          orderBy: { createdAt: "asc" }
        }
      },
      take: 20
    });

    const openParticipants = bills.flatMap((bill) =>
      bill.participants
        .filter((participant) => participant.status === PaymentStatus.PENDING)
        .map((participant) => ({
          billId: bill.id,
          billTitle: bill.title,
          participantId: participant.id,
          name: participant.name,
          phone: participant.phone,
          amount: amountFromCents(participant.amountCents - participant.paidCents)
        }))
    );

    const owedToYou = openParticipants.reduce((sum, participant) => sum + participant.amount, 0);

    return {
      summary: {
        youOwe: 0,
        owedToYou,
        totalBills: bills.length,
        openTabs: openParticipants.length
      },
      recentBills: bills.slice(0, 5).map((bill) => ({
        id: bill.id,
        title: bill.title,
        splitMode: bill.splitMode.toLowerCase(),
        total: amountFromCents(bill.totalCents),
        createdAt: bill.createdAt.toISOString(),
        people: bill.participants.length,
        status: bill.participants.every((participant) => participant.status === PaymentStatus.PAID)
          ? "settled"
          : "pending"
      })),
      openParticipants
    };
  });
}
