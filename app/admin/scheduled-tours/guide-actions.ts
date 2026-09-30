"use server";
import { auth } from "@clerk/nextjs/server";

import { db } from "@/db/db";
import {
  assignGuideToScheduledTour,
  removeGuideFromScheduledTour,
} from "@/lib/queries/scheduledTourGuides";

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

export async function assignGuideAction(externalId: number, guideId: string) {
  await requireAdmin();
  try {
    const assignment = await assignGuideToScheduledTour(externalId, guideId);

    return {
      success: true,
      data: assignment,
    };
  } catch (error) {
    console.error("Error assigning guide:", error);

    return {
      success: false,
      error: "Failed to assign guide.",
    };
  }
}

export async function removeGuideAction(externalId: number, guideId: string) {
  await requireAdmin();
  try {
    const assignment = await removeGuideFromScheduledTour(externalId, guideId);

    if (!assignment) {
      return {
        success: false,
        error: "Guide assignment not found.",
      };
    }

    return {
      success: true,
      data: assignment,
    };
  } catch (error) {
    console.error("Error removing guide:", error);

    return {
      success: false,
      error: "Failed to remove guide.",
    };
  }
}
