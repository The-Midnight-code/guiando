import { db } from "@/db/db";

import { eq } from "drizzle-orm";

import { affiliates } from "@/db/schema";

export async function getAffiliates() {
  return db.query.affiliates.findMany({
    orderBy: {
      name: "asc",
    },
  });
}

export async function getActiveAffiliates() {
  return db.query.affiliates.findMany({
    where: {
      active: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}

export async function getAffiliateById(id: string) {
  validateUuid(id, "Affiliate ID");

  return db.query.affiliates.findFirst({
    where: {
      id,
    },
  });
}

export interface CreateAffiliateInput {
  name: string;
  description?: string;
  active?: boolean;
}

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

function validateAffiliateInput(input: CreateAffiliateInput): void {
  if (!input.name.trim()) {
    throw new Error("Affiliate name is required.");
  }
}

export async function createAffiliate(input: CreateAffiliateInput) {
  validateAffiliateInput(input);

  const [affiliate] = await db
    .insert(affiliates)
    .values({
      name: input.name.trim(),
      description: input.description?.trim() || undefined,
      active: input.active ?? true,
    })
    .returning();

  return affiliate;
}

export async function updateAffiliate(id: string, input: CreateAffiliateInput) {
  validateUuid(id, "Affiliate ID");
  validateAffiliateInput(input);

  const [affiliate] = await db
    .update(affiliates)
    .set({
      name: input.name.trim(),
      description: input.description?.trim() || undefined,
      active: input.active ?? true,
      updatedAt: new Date(),
    })
    .where(eq(affiliates.id, id))
    .returning();

  return affiliate;
}

export async function toggleAffiliateActive(id: string, active: boolean) {
  validateUuid(id, "Affiliate ID");

  const [affiliate] = await db
    .update(affiliates)
    .set({
      active,
      updatedAt: new Date(),
    })
    .where(eq(affiliates.id, id))
    .returning();

  return affiliate;
}
