import { db } from "@/db/db";
import { eq, asc } from "drizzle-orm";

import { tourPhotos } from "@/db/schema";

export async function getTourPhotos(tourId: string) {
  return db.query.tourPhotos.findMany({
    where: {
      tourId,
    },
    orderBy: {
      sortOrder: "asc",
    },
  });
}

export async function getTourPhotoById(id: string) {
  return db.query.tourPhotos.findFirst({
    where: {
      id,
    },
  });
}

export interface CreateTourPhotoInput {
  tourId: string;
  url: string;
  alt?: string;
  sortOrder?: number;
}

export async function createTourPhoto(input: CreateTourPhotoInput) {
  const [photo] = await db
    .insert(tourPhotos)
    .values({
      tourId: input.tourId,
      url: input.url,
      alt: input.alt,
      sortOrder: input.sortOrder ?? 0,
    })
    .returning();

  return photo;
}

export async function updateTourPhoto(
  id: string,
  input: Omit<CreateTourPhotoInput, "tourId">,
) {
  const [photo] = await db
    .update(tourPhotos)
    .set({
      url: input.url,
      alt: input.alt,
      sortOrder: input.sortOrder ?? 0,
    })
    .where(eq(tourPhotos.id, id))
    .returning();

  return photo;
}

export async function deleteTourPhoto(id: string) {
  const [photo] = await db
    .delete(tourPhotos)
    .where(eq(tourPhotos.id, id))
    .returning();

  return photo;
}
