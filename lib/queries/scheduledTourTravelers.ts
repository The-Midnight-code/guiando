import { db } from "@/db/db";
import { and, eq } from "drizzle-orm";

import { scheduledTourTravelers, scheduledTours } from "@/db/schema";

export async function getTravelersForScheduledTour(externalId: number) {
  const scheduledTour = await db.query.scheduledTours.findFirst({
    where: {
      externalId,
    },
  });

  if (!scheduledTour) {
    return [];
  }

  return db.query.scheduledTourTravelers.findMany({
    where: {
      scheduledTourId: scheduledTour.id,
    },
    with: {
      traveler: true,
    },
  });
}

export async function assignTravelerToScheduledTour(
  externalId: number,
  travelerId: string,
) {
  const scheduledTour = await db.query.scheduledTours.findFirst({
    where: {
      externalId,
    },
  });

  if (!scheduledTour) {
    throw new Error("Scheduled tour not found.");
  }

  const existingAssignment = await db.query.scheduledTourTravelers.findFirst({
    where: {
      scheduledTourId: scheduledTour.id,
      travelerId,
    },
  });

  if (existingAssignment) {
    return existingAssignment;
  }

  const [assignment] = await db
    .insert(scheduledTourTravelers)
    .values({
      scheduledTourId: scheduledTour.id,
      travelerId,
    })
    .returning();

  return assignment;
}

export async function removeTravelerFromScheduledTour(
  externalId: number,
  travelerId: string,
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
    .delete(scheduledTourTravelers)
    .where(
      and(
        eq(scheduledTourTravelers.scheduledTourId, scheduledTour.id),
        eq(scheduledTourTravelers.travelerId, travelerId),
      ),
    )
    .returning();

  return deletedAssignment;
}
