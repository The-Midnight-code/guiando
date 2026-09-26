import { db } from "@/db/db";
import { eq, asc } from "drizzle-orm";

import { tourTypes } from "@/db/schema";

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
  const [tourType] = await db
    .insert(tourTypes)
    .values({
      name: input.name,
      description: input.description,
      active: input.active ?? true,
    })
    .returning();

  return tourType;
}

export async function updateTourType(id: string, input: CreateTourTypeInput) {
  const [tourType] = await db
    .update(tourTypes)
    .set({
      name: input.name,
      description: input.description,
      active: input.active ?? true,
      updatedAt: new Date(),
    })
    .where(eq(tourTypes.id, id))
    .returning();

  return tourType;
}

export async function toggleTourTypeActive(id: string, active: boolean) {
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
