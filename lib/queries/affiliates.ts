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

export async function createAffiliate(input: CreateAffiliateInput) {
  const [affiliate] = await db
    .insert(affiliates)
    .values({
      name: input.name,
      description: input.description,
      active: input.active ?? true,
    })
    .returning();

  return affiliate;
}

export async function updateAffiliate(id: string, input: CreateAffiliateInput) {
  const [affiliate] = await db
    .update(affiliates)
    .set({
      name: input.name,
      description: input.description,
      active: input.active ?? true,
      updatedAt: new Date(),
    })
    .where(eq(affiliates.id, id))
    .returning();

  return affiliate;
}

export async function toggleAffiliateActive(id: string, active: boolean) {
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
