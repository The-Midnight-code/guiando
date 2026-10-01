import { db } from "@/db/db";

import { asc, eq } from "drizzle-orm";

import { paymentTypes } from "@/db/schema";

function isValidUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function validateUuid(value: string, fieldName: string): void {
  if (!isValidUuid(value)) {
    throw new Error(`${fieldName} must be a valid UUID.`);
  }
}

function validatePaymentTypeInput(input: CreatePaymentTypeInput): void {
  if (!input.name.trim()) {
    throw new Error("Payment type name is required.");
  }
}

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
  validateUuid(id, "Payment type ID");

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
  validatePaymentTypeInput(input);

  const [paymentType] = await db
    .insert(paymentTypes)
    .values({
      name: input.name.trim(),
      description: input.description?.trim() || undefined,
      active: input.active ?? true,
    })
    .returning();

  return paymentType;
}

export async function updatePaymentType(
  id: string,
  input: CreatePaymentTypeInput,
) {
  validateUuid(id, "Payment type ID");
  validatePaymentTypeInput(input);

  const [paymentType] = await db
    .update(paymentTypes)
    .set({
      name: input.name.trim(),
      description: input.description?.trim() || undefined,
      active: input.active ?? true,
      updatedAt: new Date(),
    })
    .where(eq(paymentTypes.id, id))
    .returning();

  return paymentType;
}

export async function togglePaymentTypeActive(id: string, active: boolean) {
  validateUuid(id, "Payment type ID");

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
