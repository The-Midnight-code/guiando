"use server";
import { requireAdmin } from "@/lib/auth/permissions";

import {
  createTourType,
  updateTourType,
  toggleTourTypeActive,
  type CreateTourTypeInput,
} from "@/lib/queries/tourTypes";

export async function createTourTypeAction(input: CreateTourTypeInput) {
  await requireAdmin();
  try {
    const tourType = await createTourType(input);

    return {
      success: true,
      data: tourType,
    };
  } catch (error) {
    console.error("Error creating tour type:", error);

    return {
      success: false,
      error: "Failed to create tour type.",
    };
  }
}

export async function updateTourTypeAction(
  id: string,
  input: CreateTourTypeInput,
) {
  await requireAdmin();
  try {
    const tourType = await updateTourType(id, input);

    if (!tourType) {
      return {
        success: false,
        error: "Tour type not found.",
      };
    }

    return {
      success: true,
      data: tourType,
    };
  } catch (error) {
    console.error("Error updating tour type:", error);

    return {
      success: false,
      error: "Failed to update tour type.",
    };
  }
}

export async function toggleTourTypeActiveAction(id: string, active: boolean) {
  await requireAdmin();
  try {
    const tourType = await toggleTourTypeActive(id, active);

    if (!tourType) {
      return {
        success: false,
        error: "Tour type not found.",
      };
    }

    return {
      success: true,
      data: tourType,
    };
  } catch (error) {
    console.error("Error updating tour type status:", error);

    return {
      success: false,
      error: "Failed to update tour type status.",
    };
  }
}
