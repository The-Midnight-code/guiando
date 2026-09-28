import { asc, and, eq, gte, ne, or, ilike, SQL, count } from "drizzle-orm";

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
        or(
          eq(scheduledTours.status, "PENDING"),
          eq(scheduledTours.status, "CONFIRMED"),
        ),
      ),
    )
    .orderBy(asc(scheduledTours.tourDate), asc(scheduledTours.startTime))
    .limit(limit);
}

export async function getGuideScheduledTours(
  userId: string,
  status?: string,
  search?: string,
) {
  const normalizedSearch = search?.trim();

  const conditions: SQL[] = [eq(guides.userId, userId)];

  if (status) {
    conditions.push(eq(scheduledTours.status, status));
  }

  if (normalizedSearch) {
    const searchTerm = `%${normalizedSearch}%`;

    const searchCondition = or(
      ilike(tours.name, searchTerm),
      ilike(pickupLocations.name, searchTerm),
    );

    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }
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
    .where(and(...conditions))
    .orderBy(asc(scheduledTours.tourDate), asc(scheduledTours.startTime));
}

export async function getGuideDashboardStats(userId: string) {
  const today = new Date().toISOString().split("T")[0];

  const [upcomingResult, todayResult, confirmedResult] = await Promise.all([
    db
      .select({
        count: count(),
      })
      .from(scheduledTours)
      .innerJoin(
        scheduledTourGuides,
        eq(scheduledTourGuides.scheduledTourId, scheduledTours.id),
      )
      .innerJoin(guides, eq(guides.id, scheduledTourGuides.guideId))
      .where(
        and(
          eq(guides.userId, userId),
          gte(scheduledTours.tourDate, today),
          ne(scheduledTours.status, "cancelled"),
        ),
      ),

    db
      .select({
        count: count(),
      })
      .from(scheduledTours)
      .innerJoin(
        scheduledTourGuides,
        eq(scheduledTourGuides.scheduledTourId, scheduledTours.id),
      )
      .innerJoin(guides, eq(guides.id, scheduledTourGuides.guideId))
      .where(
        and(eq(guides.userId, userId), eq(scheduledTours.tourDate, today)),
      ),

    db
      .select({
        count: count(),
      })
      .from(scheduledTours)
      .innerJoin(
        scheduledTourGuides,
        eq(scheduledTourGuides.scheduledTourId, scheduledTours.id),
      )
      .innerJoin(guides, eq(guides.id, scheduledTourGuides.guideId))
      .where(
        and(eq(guides.userId, userId), eq(scheduledTours.status, "CONFIRMED")),
      ),
  ]);

  return {
    upcoming: upcomingResult[0]?.count ?? 0,
    today: todayResult[0]?.count ?? 0,
    confirmed: confirmedResult[0]?.count ?? 0,
  };
}
