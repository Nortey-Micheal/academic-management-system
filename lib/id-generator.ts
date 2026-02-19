import { Prisma } from "./generated/prisma/client";

export async function generateSequentialId(
  tx: Prisma.TransactionClient,
  type: "STUDENT" | "TEACHER"
) {
  const year = new Date().getFullYear();
  const counterId = `${type}_${year}`;

  const counter = await tx.counter.upsert({
    where: { id: counterId },
    update: { value: { increment: 1 } },
    create: { id: counterId, value: 1 }
  });

  const padded = counter.value.toString().padStart(4, "0");

  if (type === "STUDENT") {
    return `STU-${year}-${padded}`;
  }

  return `TCH-${year}-${padded}`;
}
