"use server";

import { requireAdmin } from "@/lib/auth/permissions";
import { getDatabaseErrorMessage } from "@/lib/errors/database";

import {
  createPickupLocation,
  updatePickupLocation,
  togglePickupLocationActive,
  type CreatePickupLocationInput,
} from "@/lib/queries/pickupLocations";

function getPickupLocationErrorMessage(error: unknown): string | null {
  if (!(error instanceof Error)) return null;

  const knownErrors = new Set([
    "Pickup location ID must be a valid UUID.",
    "Pickup location name is required.",
    "Pickup location address is required.",
  ]);

  return knownErrors.has(error.message) ? error.message : null;
}

export async function createPickupLocationAction(
  input: CreatePickupLocationInput,
) {
  await requireAdmin();

  try {
    const pickupLocation = await createPickupLocation(input);

    return {
      success: true,
      data: pickupLocation,
    };
  } catch (error) {
    console.error("Error creating pickup location:", error);

    return {
      success: false,
      error:
        getPickupLocationErrorMessage(error) ??
        getDatabaseErrorMessage(error) ??
        "Failed to create pickup location.",
    };
  }
}

export async function updatePickupLocationAction(
  id: string,
  input: CreatePickupLocationInput,
) {
  await requireAdmin();

  try {
    const pickupLocation = await updatePickupLocation(id, input);

    if (!pickupLocation) {
      return {
        success: false,
        error: "Pickup location not found.",
      };
    }

    return {
      success: true,
      data: pickupLocation,
    };
  } catch (error) {
    console.error("Error updating pickup location:", error);

    return {
      success: false,
      error:
        getPickupLocationErrorMessage(error) ??
        getDatabaseErrorMessage(error) ??
        "Failed to update pickup location.",
    };
  }
}

export async function togglePickupLocationActiveAction(
  id: string,
  active: boolean,
) {
  await requireAdmin();

  try {
    const pickupLocation = await togglePickupLocationActive(id, active);

    if (!pickupLocation) {
      return {
        success: false,
        error: "Pickup location not found.",
      };
    }

    return {
      success: true,
      data: pickupLocation,
    };
  } catch (error) {
    console.error("Error updating pickup location status:", error);

    return {
      success: false,
      error:
        getPickupLocationErrorMessage(error) ??
        getDatabaseErrorMessage(error) ??
        "Failed to update pickup location status.",
    };
  }
}
