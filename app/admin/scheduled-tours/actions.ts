"use server";
import { auth } from "@clerk/nextjs/server";

import { db } from "@/db/db";
import {
  createScheduledTour,
  updateScheduledTour,
  deleteScheduledTour,
  type CreateScheduledTourInput,
} from "@/lib/queries/scheduledTours";

async function requireAdmin() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const currentUser = await db.query.users.findFirst({
    where: {
      clerkId: userId,
    },
  });

  if (!currentUser || currentUser.role !== "ADMIN") {
    throw new Error("Forbidden");
  }
}

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
      error: "Failed to create scheduled tour.",
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
      error: "Failed to update scheduled tour.",
    };
  }
}

export async function deleteScheduledTourAction(externalId: number) {
  try {
    await requireAdmin();
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
