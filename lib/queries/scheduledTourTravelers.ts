import { db } from "@/db/db";

import { and, count, eq } from "drizzle-orm";

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
  return db.transaction(async (tx) => {
    const [scheduledTour] = await tx
      .select()
      .from(scheduledTours)
      .where(eq(scheduledTours.externalId, externalId))
      .limit(1);

    if (!scheduledTour) {
      throw new Error("Scheduled tour not found.");
    }

    const [existingAssignment] = await tx
      .select()
      .from(scheduledTourTravelers)
      .where(
        and(
          eq(scheduledTourTravelers.scheduledTourId, scheduledTour.id),
          eq(scheduledTourTravelers.travelerId, travelerId),
        ),
      )
      .limit(1);

    if (existingAssignment) {
      return existingAssignment;
    }

    const [assignment] = await tx
      .insert(scheduledTourTravelers)
      .values({
        scheduledTourId: scheduledTour.id,
        travelerId,
      })
      .returning();

    const [assignmentCount] = await tx
      .select({
        count: count(),
      })
      .from(scheduledTourTravelers)
      .where(eq(scheduledTourTravelers.scheduledTourId, scheduledTour.id));

    await tx
      .update(scheduledTours)
      .set({
        numberOfPeople: assignmentCount?.count ?? 0,
        updatedAt: new Date(),
      })
      .where(eq(scheduledTours.id, scheduledTour.id));

    return assignment;
  });
}

export async function removeTravelerFromScheduledTour(
  externalId: number,
  travelerId: string,
) {
  return db.transaction(async (tx) => {
    const [scheduledTour] = await tx
      .select()
      .from(scheduledTours)
      .where(eq(scheduledTours.externalId, externalId))
      .limit(1);

    if (!scheduledTour) {
      throw new Error("Scheduled tour not found.");
    }

    const [deletedAssignment] = await tx
      .delete(scheduledTourTravelers)
      .where(
        and(
          eq(scheduledTourTravelers.scheduledTourId, scheduledTour.id),
          eq(scheduledTourTravelers.travelerId, travelerId),
        ),
      )
      .returning();

    if (!deletedAssignment) {
      return undefined;
    }

    const [assignmentCount] = await tx
      .select({
        count: count(),
      })
      .from(scheduledTourTravelers)
      .where(eq(scheduledTourTravelers.scheduledTourId, scheduledTour.id));

    await tx
      .update(scheduledTours)
      .set({
        numberOfPeople: assignmentCount?.count ?? 0,
        updatedAt: new Date(),
      })
      .where(eq(scheduledTours.id, scheduledTour.id));

    return deletedAssignment;
  });
}

export async function syncNumberOfPeople(externalId: number) {
  const scheduledTour = await db.query.scheduledTours.findFirst({
    where: {
      externalId,
    },
  });

  if (!scheduledTour) {
    throw new Error("Scheduled tour not found.");
  }

  const [assignmentCount] = await db
    .select({
      count: count(),
    })
    .from(scheduledTourTravelers)
    .where(eq(scheduledTourTravelers.scheduledTourId, scheduledTour.id));

  const [updatedScheduledTour] = await db
    .update(scheduledTours)
    .set({
      numberOfPeople: assignmentCount?.count ?? 0,
      updatedAt: new Date(),
    })
    .where(eq(scheduledTours.id, scheduledTour.id))
    .returning();

  return updatedScheduledTour;
}
