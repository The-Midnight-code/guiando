"use server";

import {
  createScheduledTour,
  updateScheduledTour,
  deleteScheduledTour,
  type CreateScheduledTourInput,
} from "@/lib/queries/scheduledTours";

export async function createScheduledTourAction(
  input: CreateScheduledTourInput,
) {
  try {
    const scheduledTour = await createScheduledTour(input);

    return {
      success: true,
      data: scheduledTour,
    };
  } catch (error) {
    console.error("Error creating scheduled tour:", error);

    return {
      success: false,
      error: "Failed to create scheduled tour.",
    };
  }
}

export async function updateScheduledTourAction(
  externalId: number,
  input: CreateScheduledTourInput,
) {
  console.log("UPDATE INPUT:", input);
  try {
    const scheduledTour = await updateScheduledTour(externalId, input);

    if (!scheduledTour) {
      return {
        success: false,
        error: "Scheduled tour not found.",
      };
    }

    return {
      success: true,
      data: scheduledTour,
    };
  } catch (error) {
    console.error("Error updating scheduled tour:", error);

    return {
      success: false,
      error: "Failed to update scheduled tour.",
    };
  }
}

export async function deleteScheduledTourAction(externalId: number) {
  try {
    const deletedScheduledTour = await deleteScheduledTour(externalId);

    if (!deletedScheduledTour) {
      return {
        success: false,
        error: "Scheduled tour not found.",
      };
    }

    return {
      success: true,
      data: deletedScheduledTour,
    };
  } catch (error) {
    console.error("Error deleting scheduled tour:", error);

    return {
      success: false,
      error: "Failed to delete scheduled tour.",
    };
  }
}
