import { db } from "@/db/db";
import { eq, and, asc } from "drizzle-orm";

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

export async function createTour(input: CreateTourInput) {
  const [tour] = await db
    .insert(tours)
    .values({
      productId: input.productId,
      name: input.name,
      description: input.description,
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
  const [tour] = await db
    .update(tours)
    .set({
      productId: input.productId,
      name: input.name,
      description: input.description,
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
  const [tour] = await db.delete(tours).where(eq(tours.id, id)).returning();

  return tour;
}
