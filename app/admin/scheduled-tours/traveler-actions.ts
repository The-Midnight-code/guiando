"use server";
import { requireAdmin } from "@/lib/auth/permissions";

import {
  createTraveler,
  updateTraveler,
  type CreateTravelerInput,
} from "@/lib/queries/travelers";

import {
  assignTravelerToScheduledTour,
  removeTravelerFromScheduledTour,
  syncNumberOfPeople,
} from "@/lib/queries/scheduledTourTravelers";

export async function assignTravelerAction(
  externalId: number,
  travelerId: string,
) {
  await requireAdmin();
  try {
    const assignment = await assignTravelerToScheduledTour(
      externalId,
      travelerId,
    );

    await syncNumberOfPeople(externalId);

    return {
      success: true,
      data: assignment,
    };
  } catch (error) {
    console.error("Error assigning traveler:", error);

    return {
      success: false,
      error: "Failed to assign traveler.",
    };
  }
}

export async function removeTravelerAction(
  externalId: number,
  travelerId: string,
) {
  await requireAdmin();
  try {
    const assignment = await removeTravelerFromScheduledTour(
      externalId,
      travelerId,
    );

    if (!assignment) {
      return {
        success: false,
        error: "Traveler assignment not found.",
      };
    }

    await syncNumberOfPeople(externalId);

    return {
      success: true,
      data: assignment,
    };
  } catch (error) {
    console.error("Error removing traveler:", error);

    return {
      success: false,
      error: "Failed to remove traveler.",
    };
  }
}

export async function createTravelerAction(input: CreateTravelerInput) {
  await requireAdmin();
  try {
    const traveler = await createTraveler(input);

    return {
      success: true,
      data: traveler,
    };
  } catch (error) {
    console.error("Error creating traveler:", error);

    return {
      success: false,
      error: "Failed to create traveler.",
    };
  }
}

export async function updateTravelerAction(
  id: string,
  input: CreateTravelerInput,
) {
  await requireAdmin();
  try {
    const traveler = await updateTraveler(id, input);

    if (!traveler) {
      return {
        success: false,
        error: "Traveler not found.",
      };
    }

    return {
      success: true,
      data: traveler,
    };
  } catch (error) {
    console.error("Error updating traveler:", error);

    return {
      success: false,
      error: "Failed to update traveler.",
    };
  }
}
