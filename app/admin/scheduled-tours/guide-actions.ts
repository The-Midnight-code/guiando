"use server";

import {
  assignGuideToScheduledTour,
  removeGuideFromScheduledTour,
} from "@/lib/queries/scheduledTourGuides";

export async function assignGuideAction(externalId: number, guideId: string) {
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
