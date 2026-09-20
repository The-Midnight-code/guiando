import { db } from "@/db/db";
import { and, eq } from "drizzle-orm";

import { scheduledTourGuides, scheduledTours } from "@/db/schema";

export async function getGuidesForScheduledTour(externalId: number) {
  const scheduledTour = await db.query.scheduledTours.findFirst({
    where: {
      externalId,
    },
  });

  if (!scheduledTour) {
    return [];
  }

  return db.query.scheduledTourGuides.findMany({
    where: {
      scheduledTourId: scheduledTour.id,
    },
    with: {
      guide: {
        with: {
          user: true,
        },
      },
    },
  });
}

export async function assignGuideToScheduledTour(
  externalId: number,
  guideId: string,
) {
  const scheduledTour = await db.query.scheduledTours.findFirst({
    where: {
      externalId,
    },
  });

  if (!scheduledTour) {
    throw new Error("Scheduled tour not found.");
  }

  const existingAssignment = await db.query.scheduledTourGuides.findFirst({
    where: {
      scheduledTourId: scheduledTour.id,
      guideId,
    },
  });

  if (existingAssignment) {
    return existingAssignment;
  }

  const [assignment] = await db
    .insert(scheduledTourGuides)
    .values({
      scheduledTourId: scheduledTour.id,
      guideId,
    })
    .returning();

  return assignment;
}

export async function removeGuideFromScheduledTour(
  externalId: number,
  guideId: string,
) {
  const scheduledTour = await db.query.scheduledTours.findFirst({
    where: {
      externalId,
    },
  });

  if (!scheduledTour) {
    throw new Error("Scheduled tour not found.");
  }

  const [deletedAssignment] = await db
    .delete(scheduledTourGuides)
    .where(
      and(
        eq(scheduledTourGuides.scheduledTourId, scheduledTour.id),
        eq(scheduledTourGuides.guideId, guideId),
      ),
    )
    .returning();

  return deletedAssignment;
}
