import { db } from "@/db/db";

import { and, asc, eq } from "drizzle-orm";

import { tours } from "@/db/schema";

export async function getTours() {
  return db.query.tours.findMany({
    with: {
      tourType: true,
      tourClass: true,
      photos: true,
    },
  });
}

export async function getActiveTours(tourTypeId?: string) {
  const conditions = [eq(tours.active, true)];

  if (tourTypeId) {
    conditions.push(eq(tours.tourTypeId, tourTypeId));
  }

  return db
    .select({
      id: tours.id,
      name: tours.name,
    })
    .from(tours)
    .where(and(...conditions))
    .orderBy(asc(tours.name));
}

export async function getTourById(id: string) {
  return db.query.tours.findFirst({
    where: {
      id,
    },
    with: {
      tourType: true,
      tourClass: true,
      photos: true,
    },
  });
}

export interface CreateTourInput {
  productId?: string;
  name: string;
  description?: string;
  duration?: number;
  price?: string;
  tourTypeId: string;
  tourClassId?: string;
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

function validateTourInput(input: CreateTourInput): void {
  if (!input.name.trim()) {
    throw new Error("Tour name is required.");
  }

  validateUuid(input.tourTypeId, "Tour type ID");

  if (input.tourClassId) {
    validateUuid(input.tourClassId, "Tour class ID");
  }

  if (
    input.duration !== undefined &&
    (!Number.isInteger(input.duration) || input.duration <= 0)
  ) {
    throw new Error("Duration must be a positive integer.");
  }

  if (input.price !== undefined && input.price.trim() !== "") {
    const price = Number(input.price);

    if (!Number.isFinite(price) || price < 0 || price > 99999999.99) {
      throw new Error("Price must be a valid non-negative number.");
    }

    if (Math.round(price * 100) !== price * 100) {
      throw new Error("Price cannot have more than 2 decimal places.");
    }
  }
}

async function validateTourReferences(input: CreateTourInput): Promise<void> {
  const [tourType, tourClass] = await Promise.all([
    db.query.tourTypes.findFirst({
      where: {
        id: input.tourTypeId,
      },
    }),
    input.tourClassId
      ? db.query.tourClasses.findFirst({
          where: {
            id: input.tourClassId,
          },
        })
      : Promise.resolve(null),
  ]);

  if (!tourType) {
    throw new Error("Tour type not found.");
  }

  if (input.tourClassId && !tourClass) {
    throw new Error("Tour class not found.");
  }
}

export async function createTour(input: CreateTourInput) {
  validateTourInput(input);
  await validateTourReferences(input);

  const [tour] = await db
    .insert(tours)
    .values({
      productId: input.productId?.trim() || undefined,
      name: input.name.trim(),
      description: input.description?.trim() || undefined,
      duration: input.duration,
      price: input.price,
      tourTypeId: input.tourTypeId,
      tourClassId: input.tourClassId,
      active: input.active ?? true,
    })
    .returning();

  return tour;
}

export async function updateTour(id: string, input: CreateTourInput) {
  validateUuid(id, "Tour ID");
  validateTourInput(input);
  await validateTourReferences(input);

  const [tour] = await db
    .update(tours)
    .set({
      productId: input.productId?.trim() || undefined,
      name: input.name.trim(),
      description: input.description?.trim() || undefined,
      duration: input.duration,
      price: input.price,
      tourTypeId: input.tourTypeId,
      tourClassId: input.tourClassId,
      active: input.active ?? true,
      updatedAt: new Date(),
    })
    .where(eq(tours.id, id))
    .returning();

  return tour;
}

export async function deleteTour(id: string) {
  validateUuid(id, "Tour ID");

  const [tour] = await db.delete(tours).where(eq(tours.id, id)).returning();

  return tour;
}
