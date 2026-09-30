"use server";
import { requireAdmin } from "@/lib/auth/permissions";

import {
  createTour,
  updateTour,
  deleteTour,
  type CreateTourInput,
} from "@/lib/queries/tours";

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
      error: "Failed to create tour.",
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
      error: "Failed to update tour.",
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
      error: "Failed to delete tour.",
    };
  }
}
