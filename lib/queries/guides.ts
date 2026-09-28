import { asc, and, eq, gte, ne } from "drizzle-orm";

import { db } from "@/db/db";
import {
  guides,
  pickupLocations,
  scheduledTourGuides,
  scheduledTours,
  tours,
} from "@/db/schema";

export async function getActiveGuides() {
  return db.query.guides.findMany({
    where: {
      active: true,
    },
    with: {
      user: true,
    },
  });
}

export async function getGuideUpcomingTours(userId: string, limit = 5) {
  const today = new Date().toISOString().split("T")[0];

  return db
    .select({
      id: scheduledTours.id,
      externalId: scheduledTours.externalId,
      tourDate: scheduledTours.tourDate,
      startTime: scheduledTours.startTime,
      endTime: scheduledTours.endTime,
      status: scheduledTours.status,
      numberOfPeople: scheduledTours.numberOfPeople,
      tourName: tours.name,
      pickupLocation: pickupLocations.name,
    })
    .from(scheduledTours)
    .innerJoin(
      scheduledTourGuides,
      eq(scheduledTourGuides.scheduledTourId, scheduledTours.id),
    )
    .innerJoin(guides, eq(guides.id, scheduledTourGuides.guideId))
    .innerJoin(tours, eq(tours.id, scheduledTours.tourId))
    .innerJoin(
      pickupLocations,
      eq(pickupLocations.id, scheduledTours.pickupLocationId),
    )
    .where(
      and(
        eq(guides.userId, userId),
        gte(scheduledTours.tourDate, today),
        ne(scheduledTours.status, "cancelled"),
      ),
    )
    .orderBy(asc(scheduledTours.tourDate), asc(scheduledTours.startTime))
    .limit(limit);
}
