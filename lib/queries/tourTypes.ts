import { db } from "@/db/db";

import { asc, eq } from "drizzle-orm";

import { tourTypes } from "@/db/schema";

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

function validateTourTypeInput(input: CreateTourTypeInput): void {
  if (!input.name.trim()) {
    throw new Error("Tour type name is required.");
  }
}

export async function getTourTypes() {
  return db.query.tourTypes.findMany({
    orderBy: {
      name: "asc",
    },
  });
}

export async function getActiveTourTypes() {
  return db
    .select({
      id: tourTypes.id,
      name: tourTypes.name,
    })
    .from(tourTypes)
    .where(eq(tourTypes.active, true))
    .orderBy(asc(tourTypes.name));
}

export async function getTourTypeById(id: string) {
  validateUuid(id, "Tour type ID");

  return db.query.tourTypes.findFirst({
    where: {
      id,
    },
  });
}

export interface CreateTourTypeInput {
  name: string;
  description?: string;
  active?: boolean;
}

export async function createTourType(input: CreateTourTypeInput) {
  validateTourTypeInput(input);

  const [tourType] = await db
    .insert(tourTypes)
    .values({
      name: input.name.trim(),
      description: input.description?.trim() || undefined,
      active: input.active ?? true,
    })
    .returning();

  return tourType;
}

export async function updateTourType(id: string, input: CreateTourTypeInput) {
  validateUuid(id, "Tour type ID");
  validateTourTypeInput(input);

  const [tourType] = await db
    .update(tourTypes)
    .set({
      name: input.name.trim(),
      description: input.description?.trim() || undefined,
      active: input.active ?? true,
      updatedAt: new Date(),
    })
    .where(eq(tourTypes.id, id))
    .returning();

  return tourType;
}

export async function toggleTourTypeActive(id: string, active: boolean) {
  validateUuid(id, "Tour type ID");

  const [tourType] = await db
    .update(tourTypes)
    .set({
      active,
      updatedAt: new Date(),
    })
    .where(eq(tourTypes.id, id))
    .returning();

  return tourType;
}
