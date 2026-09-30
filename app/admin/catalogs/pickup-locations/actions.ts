"use server";
import { requireAdmin } from "@/lib/auth/permissions";

import {
  createPickupLocation,
  updatePickupLocation,
  togglePickupLocationActive,
  type CreatePickupLocationInput,
} from "@/lib/queries/pickupLocations";

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
      error: "Failed to create pickup location.",
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
      error: "Failed to update pickup location.",
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
      error: "Failed to update pickup location status.",
    };
  }
}
