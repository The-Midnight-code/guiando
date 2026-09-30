"use server";

import { requireAdmin } from "@/lib/auth/permissions";
import {
  assignGuideToScheduledTour,
  removeGuideFromScheduledTour,
} from "@/lib/queries/scheduledTourGuides";

function getGuideAssignmentErrorMessage(error: unknown): string | null {
  if (!(error instanceof Error)) {
    return null;
  }

  const knownErrors = new Set([
    "Scheduled tour not found.",
    "Guide not found.",
    "Guide is inactive.",
  ]);

  return knownErrors.has(error.message) ? error.message : null;
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
      error: getGuideAssignmentErrorMessage(error) ?? "Failed to assign guide.",
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
      error: getGuideAssignmentErrorMessage(error) ?? "Failed to remove guide.",
    };
  }
}
