import { db } from "@/db/db";
import { eq } from "drizzle-orm";

import { tourClasses } from "@/db/schema";

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
  const [tourClass] = await db
    .insert(tourClasses)
    .values({
      name: input.name,
      description: input.description,
      active: input.active ?? true,
    })
    .returning();

  return tourClass;
}

export async function updateTourClass(id: string, input: CreateTourClassInput) {
  const [tourClass] = await db
    .update(tourClasses)
    .set({
      name: input.name,
      description: input.description,
      active: input.active ?? true,
      updatedAt: new Date(),
    })
    .where(eq(tourClasses.id, id))
    .returning();

  return tourClass;
}

export async function toggleTourClassActive(id: string, active: boolean) {
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
