import { db } from "@/db/db";

import { eq } from "drizzle-orm";

import { tourPhotos } from "@/db/schema";

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

function validatePhotoInput(url: string, sortOrder: number | undefined): void {
  if (!url.trim()) {
    throw new Error("Photo URL is required.");
  }

  if (
    sortOrder !== undefined &&
    (!Number.isInteger(sortOrder) || sortOrder < 0)
  ) {
    throw new Error("Sort order must be a non-negative integer.");
  }
}

async function validateTourExists(tourId: string): Promise<void> {
  const tour = await db.query.tours.findFirst({
    where: {
      id: tourId,
    },
  });

  if (!tour) {
    throw new Error("Tour not found.");
  }
}

export async function getTourPhotos(tourId: string) {
  validateUuid(tourId, "Tour ID");

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
  validateUuid(id, "Photo ID");

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
  validateUuid(input.tourId, "Tour ID");
  validatePhotoInput(input.url, input.sortOrder);
  await validateTourExists(input.tourId);

  const [photo] = await db
    .insert(tourPhotos)
    .values({
      tourId: input.tourId,
      url: input.url.trim(),
      alt: input.alt?.trim() || undefined,
      sortOrder: input.sortOrder ?? 0,
    })
    .returning();

  return photo;
}

export async function updateTourPhoto(
  id: string,
  input: Omit<CreateTourPhotoInput, "tourId">,
) {
  validateUuid(id, "Photo ID");
  validatePhotoInput(input.url, input.sortOrder);

  const [photo] = await db
    .update(tourPhotos)
    .set({
      url: input.url.trim(),
      alt: input.alt?.trim() || undefined,
      sortOrder: input.sortOrder ?? 0,
    })
    .where(eq(tourPhotos.id, id))
    .returning();

  return photo;
}

export async function deleteTourPhoto(id: string) {
  validateUuid(id, "Photo ID");

  const [photo] = await db
    .delete(tourPhotos)
    .where(eq(tourPhotos.id, id))
    .returning();

  return photo;
}
