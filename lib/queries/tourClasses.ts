import { db } from "@/db/db";

import { eq } from "drizzle-orm";

import { tourClasses } from "@/db/schema";

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

function validateTourClassInput(input: CreateTourClassInput): void {
  if (!input.name.trim()) {
    throw new Error("Tour class name is required.");
  }
}

export async function getTourClasses() {
  return db.query.tourClasses.findMany({
    orderBy: {
      name: "asc",
    },
  });
}

export async function getActiveTourClasses() {
  return db.query.tourClasses.findMany({
    where: {
      active: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}

export async function getTourClassById(id: string) {
  validateUuid(id, "Tour class ID");

  return db.query.tourClasses.findFirst({
    where: {
      id,
    },
  });
}

export interface CreateTourClassInput {
  name: string;
  description?: string;
  active?: boolean;
}

export async function createTourClass(input: CreateTourClassInput) {
  validateTourClassInput(input);

  const [tourClass] = await db
    .insert(tourClasses)
    .values({
      name: input.name.trim(),
      description: input.description?.trim() || undefined,
      active: input.active ?? true,
    })
    .returning();

  return tourClass;
}

export async function updateTourClass(id: string, input: CreateTourClassInput) {
  validateUuid(id, "Tour class ID");
  validateTourClassInput(input);

  const [tourClass] = await db
    .update(tourClasses)
    .set({
      name: input.name.trim(),
      description: input.description?.trim() || undefined,
      active: input.active ?? true,
      updatedAt: new Date(),
    })
    .where(eq(tourClasses.id, id))
    .returning();

  return tourClass;
}

export async function toggleTourClassActive(id: string, active: boolean) {
  validateUuid(id, "Tour class ID");

  const [tourClass] = await db
    .update(tourClasses)
    .set({
      active,
      updatedAt: new Date(),
    })
    .where(eq(tourClasses.id, id))
    .returning();

  return tourClass;
}
