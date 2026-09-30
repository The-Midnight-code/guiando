import { db } from "@/db/db";

import { and, eq } from "drizzle-orm";

import { guides, scheduledTourGuides, scheduledTours } from "@/db/schema";

export async function getGuidesForScheduledTour(externalId: number) {
  if (!Number.isInteger(externalId) || externalId <= 0) {
    throw new Error("External ID must be a positive integer.");
  }

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
  if (!Number.isInteger(externalId) || externalId <= 0) {
    throw new Error("External ID must be a positive integer.");
  }

  return db.transaction(async (tx) => {
    const [scheduledTour] = await tx
      .select()
      .from(scheduledTours)
      .where(eq(scheduledTours.externalId, externalId))
      .limit(1);

    if (!scheduledTour) {
      throw new Error("Scheduled tour not found.");
    }

    const [guide] = await tx
      .select()
      .from(guides)
      .where(eq(guides.id, guideId))
      .limit(1);

    if (!guide) {
      throw new Error("Guide not found.");
    }

    if (!guide.active) {
      throw new Error("Guide is inactive.");
    }

    const [existingAssignment] = await tx
      .select()
      .from(scheduledTourGuides)
      .where(
        and(
          eq(scheduledTourGuides.scheduledTourId, scheduledTour.id),
          eq(scheduledTourGuides.guideId, guideId),
        ),
      )
      .limit(1);

    if (existingAssignment) {
      return existingAssignment;
    }

    const [assignment] = await tx
      .insert(scheduledTourGuides)
      .values({
        scheduledTourId: scheduledTour.id,
        guideId,
      })
      .returning();

    return assignment;
  });
}

export async function removeGuideFromScheduledTour(
  externalId: number,
  guideId: string,
) {
  if (!Number.isInteger(externalId) || externalId <= 0) {
    throw new Error("External ID must be a positive integer.");
  }

  const [scheduledTour] = await db
    .select()
    .from(scheduledTours)
    .where(eq(scheduledTours.externalId, externalId))
    .limit(1);

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
