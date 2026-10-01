"use server";

import { requireAdmin } from "@/lib/auth/permissions";
import { getDatabaseErrorMessage } from "@/lib/errors/database";

import {
  createTourPhoto,
  updateTourPhoto,
  deleteTourPhoto,
  type CreateTourPhotoInput,
} from "@/lib/queries/tourPhotos";

function getTourPhotoErrorMessage(error: unknown): string | null {
  if (!(error instanceof Error)) return null;

  const knownErrors = new Set([
    "Photo ID must be a valid UUID.",
    "Tour ID must be a valid UUID.",
    "Photo URL is required.",
    "Sort order must be a non-negative integer.",
    "Tour not found.",
  ]);

  return knownErrors.has(error.message) ? error.message : null;
}

export async function createTourPhotoAction(input: CreateTourPhotoInput) {
  await requireAdmin();

  try {
    const photo = await createTourPhoto(input);

    return {
      success: true,
      data: photo,
    };
  } catch (error) {
    console.error("Error creating tour photo:", error);

    return {
      success: false,
      error:
        getTourPhotoErrorMessage(error) ??
        getDatabaseErrorMessage(error) ??
        "Failed to create tour photo.",
    };
  }
}

export async function updateTourPhotoAction(
  id: string,
  input: Omit<CreateTourPhotoInput, "tourId">,
) {
  await requireAdmin();

  try {
    const photo = await updateTourPhoto(id, input);

    if (!photo) {
      return {
        success: false,
        error: "Tour photo not found.",
      };
    }

    return {
      success: true,
      data: photo,
    };
  } catch (error) {
    console.error("Error updating tour photo:", error);

    return {
      success: false,
      error:
        getTourPhotoErrorMessage(error) ??
        getDatabaseErrorMessage(error) ??
        "Failed to update tour photo.",
    };
  }
}

export async function deleteTourPhotoAction(id: string) {
  await requireAdmin();

  try {
    const photo = await deleteTourPhoto(id);

    if (!photo) {
      return {
        success: false,
        error: "Tour photo not found.",
      };
    }

    return {
      success: true,
      data: photo,
    };
  } catch (error) {
    console.error("Error deleting tour photo:", error);

    return {
      success: false,
      error:
        getTourPhotoErrorMessage(error) ??
        getDatabaseErrorMessage(error) ??
        "Failed to delete tour photo.",
    };
  }
}
