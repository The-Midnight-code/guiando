"use server";
import { requireAdmin } from "@/lib/auth/permissions";
import {
  createScheduledTour,
  updateScheduledTour,
  deleteScheduledTour,
  type CreateScheduledTourInput,
} from "@/lib/queries/scheduledTours";
import {
  getDatabaseErrorMessage,
  getScheduledTourErrorMessage,
} from "@/lib/errors/database";

export async function createScheduledTourAction(
  input: CreateScheduledTourInput,
) {
  await requireAdmin();
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
      error:
        getDatabaseErrorMessage(error) ?? "Failed to create scheduled tour.",
    };
  }
}

export async function updateScheduledTourAction(
  externalId: number,
  input: CreateScheduledTourInput,
) {
  await requireAdmin();
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
      error:
        getDatabaseErrorMessage(error) ?? "Failed to update scheduled tour.",
    };
  }
}

export async function deleteScheduledTourAction(externalId: number) {
  await requireAdmin();

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
      error:
        getScheduledTourErrorMessage(error) ??
        getDatabaseErrorMessage(error) ??
        "Failed to delete scheduled tour.",
    };
  }
}
