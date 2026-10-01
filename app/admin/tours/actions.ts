"use server";

import { requireAdmin } from "@/lib/auth/permissions";
import { getDatabaseErrorMessage } from "@/lib/errors/database";

import {
  createTour,
  updateTour,
  deleteTour,
  type CreateTourInput,
} from "@/lib/queries/tours";

function getTourErrorMessage(error: unknown): string | null {
  if (!(error instanceof Error)) return null;

  const knownErrors = new Set([
    "Tour ID must be a valid UUID.",
    "Tour type ID must be a valid UUID.",
    "Tour class ID must be a valid UUID.",
    "Tour name is required.",
    "Duration must be a positive integer.",
    "Price must be a valid non-negative number.",
    "Price cannot have more than 2 decimal places.",
    "Tour type not found.",
    "Tour class not found.",
  ]);

  return knownErrors.has(error.message) ? error.message : null;
}

export async function createTourAction(input: CreateTourInput) {
  await requireAdmin();

  try {
    const tour = await createTour(input);

    return {
      success: true,
      data: tour,
    };
  } catch (error) {
    console.error("Error creating tour:", error);

    return {
      success: false,
      error:
        getTourErrorMessage(error) ??
        getDatabaseErrorMessage(error) ??
        "Failed to create tour.",
    };
  }
}

export async function updateTourAction(id: string, input: CreateTourInput) {
  await requireAdmin();

  try {
    const tour = await updateTour(id, input);

    if (!tour) {
      return {
        success: false,
        error: "Tour not found.",
      };
    }

    return {
      success: true,
      data: tour,
    };
  } catch (error) {
    console.error("Error updating tour:", error);

    return {
      success: false,
      error:
        getTourErrorMessage(error) ??
        getDatabaseErrorMessage(error) ??
        "Failed to update tour.",
    };
  }
}

export async function deleteTourAction(id: string) {
  await requireAdmin();

  try {
    const tour = await deleteTour(id);

    if (!tour) {
      return {
        success: false,
        error: "Tour not found.",
      };
    }

    return {
      success: true,
      data: tour,
    };
  } catch (error) {
    console.error("Error deleting tour:", error);

    return {
      success: false,
      error:
        getTourErrorMessage(error) ??
        getDatabaseErrorMessage(error) ??
        "Failed to delete tour.",
    };
  }
}
