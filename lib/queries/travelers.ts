import { db } from "@/db/db";

import { eq } from "drizzle-orm";

import { travelers } from "@/db/schema";

function isValidUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export async function getTravelers() {
  return db.query.travelers.findMany({
    orderBy: {
      firstName: "asc",
    },
  });
}

export async function getTravelerById(id: string) {
  if (!isValidUuid(id)) {
    throw new Error("Traveler ID must be a valid UUID.");
  }

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

function validateTravelerInput(input: CreateTravelerInput): void {
  const firstName = input.firstName.trim();

  if (!firstName) {
    throw new Error("First name is required.");
  }

  if (firstName.length > 100) {
    throw new Error("First name is too long.");
  }

  if (input.lastName && input.lastName.trim().length > 100) {
    throw new Error("Last name is too long.");
  }

  if (input.email) {
    const email = input.email.trim();

    if (email.length > 255) {
      throw new Error("Email is too long.");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Email must be valid.");
    }
  }

  if (input.phone && input.phone.trim().length > 30) {
    throw new Error("Phone number is too long.");
  }
}

export async function createTraveler(input: CreateTravelerInput) {
  validateTravelerInput(input);

  const [traveler] = await db
    .insert(travelers)
    .values({
      firstName: input.firstName.trim(),
      lastName: input.lastName?.trim() || null,
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
    })
    .returning();

  return traveler;
}

export async function updateTraveler(id: string, input: CreateTravelerInput) {
  if (!isValidUuid(id)) {
    throw new Error("Traveler ID must be a valid UUID.");
  }

  validateTravelerInput(input);

  const [traveler] = await db
    .update(travelers)
    .set({
      firstName: input.firstName.trim(),
      lastName: input.lastName?.trim() || null,
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
      updatedAt: new Date(),
    })
    .where(eq(travelers.id, id))
    .returning();

  return traveler;
}
