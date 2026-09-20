import { db } from "@/db/db";
import { eq } from "drizzle-orm";

import { paymentTypes } from "@/db/schema";

export async function getPaymentTypes() {
  return db.query.paymentTypes.findMany({
    orderBy: {
      name: "asc",
    },
  });
}

export async function getActivePaymentTypes() {
  return db.query.paymentTypes.findMany({
    where: {
      active: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}

export async function getPaymentTypeById(id: string) {
  return db.query.paymentTypes.findFirst({
    where: {
      id,
    },
  });
}

export interface CreatePaymentTypeInput {
  name: string;
  description?: string;
  active?: boolean;
}

export async function createPaymentType(input: CreatePaymentTypeInput) {
  const [paymentType] = await db
    .insert(paymentTypes)
    .values({
      name: input.name,
      description: input.description,
      active: input.active ?? true,
    })
    .returning();

  return paymentType;
}

export async function updatePaymentType(
  id: string,
  input: CreatePaymentTypeInput,
) {
  const [paymentType] = await db
    .update(paymentTypes)
    .set({
      name: input.name,
      description: input.description,
      active: input.active ?? true,
      updatedAt: new Date(),
    })
    .where(eq(paymentTypes.id, id))
    .returning();

  return paymentType;
}

export async function togglePaymentTypeActive(id: string, active: boolean) {
  const [paymentType] = await db
    .update(paymentTypes)
    .set({
      active,
      updatedAt: new Date(),
    })
    .where(eq(paymentTypes.id, id))
    .returning();

  return paymentType;
}
