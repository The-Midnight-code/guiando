"use server";

import { requireAdmin } from "@/lib/auth/permissions";
import { getDatabaseErrorMessage } from "@/lib/errors/database";

import {
  createTourClass,
  updateTourClass,
  toggleTourClassActive,
  type CreateTourClassInput,
} from "@/lib/queries/tourClasses";

function getTourClassErrorMessage(error: unknown): string | null {
  if (!(error instanceof Error)) return null;

  const knownErrors = new Set([
    "Tour class ID must be a valid UUID.",
    "Tour class name is required.",
  ]);

  return knownErrors.has(error.message) ? error.message : null;
}

export async function createTourClassAction(input: CreateTourClassInput) {
  await requireAdmin();

  try {
    const tourClass = await createTourClass(input);

    return {
      success: true,
      data: tourClass,
    };
  } catch (error) {
    console.error("Error creating tour class:", error);

    return {
      success: false,
      error:
        getTourClassErrorMessage(error) ??
        getDatabaseErrorMessage(error) ??
        "Failed to create tour class.",
    };
  }
}

export async function updateTourClassAction(
  id: string,
  input: CreateTourClassInput,
) {
  await requireAdmin();

  try {
    const tourClass = await updateTourClass(id, input);

    if (!tourClass) {
      return {
        success: false,
        error: "Tour class not found.",
      };
    }

    return {
      success: true,
      data: tourClass,
    };
  } catch (error) {
    console.error("Error updating tour class:", error);

    return {
      success: false,
      error:
        getTourClassErrorMessage(error) ??
        getDatabaseErrorMessage(error) ??
        "Failed to update tour class.",
    };
  }
}

export async function toggleTourClassActiveAction(id: string, active: boolean) {
  await requireAdmin();

  try {
    const tourClass = await toggleTourClassActive(id, active);

    if (!tourClass) {
      return {
        success: false,
        error: "Tour class not found.",
      };
    }

    return {
      success: true,
      data: tourClass,
    };
  } catch (error) {
    console.error("Error updating tour class status:", error);

    return {
      success: false,
      error:
        getTourClassErrorMessage(error) ??
        getDatabaseErrorMessage(error) ??
        "Failed to update tour class status.",
    };
  }
}
