import { db } from "@/db/db";
import { eq } from "drizzle-orm";

import { travelers } from "@/db/schema";

export async function getTravelers() {
  return db.query.travelers.findMany({
    orderBy: {
      firstName: "asc",
    },
  });
}

export async function getTravelerById(id: string) {
  return db.query.travelers.findFirst({
    where: {
      id,
    },
  });
}

export interface CreateTravelerInput {
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export async function createTraveler(input: CreateTravelerInput) {
  const [traveler] = await db
    .insert(travelers)
    .values({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
    })
    .returning();

  return traveler;
}

export async function updateTraveler(id: string, input: CreateTravelerInput) {
  const [traveler] = await db
    .update(travelers)
    .set({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      updatedAt: new Date(),
    })
    .where(eq(travelers.id, id))
    .returning();

  return traveler;
}
