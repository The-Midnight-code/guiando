import { count, asc, eq, gte, ne, and, inArray } from "drizzle-orm";
import {
  guides,
  scheduledTours,
  travelers,
  tours,
  scheduledTourGuides,
  users,
} from "@/db/schema";

import { db } from "@/db/db";

export async function getAdminDashboardStats() {
  const [scheduledToursResult, toursResult, guidesResult, travelersResult] =
    await Promise.all([
      db.select({ count: count() }).from(scheduledTours),

      db.select({ count: count() }).from(tours).where(eq(tours.active, true)),

      db.select({ count: count() }).from(guides),
      db.select({ count: count() }).from(travelers),
    ]);

  return {
    scheduledTours: Number(scheduledToursResult[0]?.count ?? 0),
    activeTours: Number(toursResult[0]?.count ?? 0),
    guides: Number(guidesResult[0]?.count ?? 0),
    travelers: Number(travelersResult[0]?.count ?? 0),
  };
}

export async function getUpcomingTours(limit = 5) {
  const today = new Date().toISOString().split("T")[0];

  const upcomingTours = await db
    .select({
      id: scheduledTours.id,
      externalId: scheduledTours.externalId,
      tourDate: scheduledTours.tourDate,
      status: scheduledTours.status,
      tourName: tours.name,
      numberOfPeople: scheduledTours.numberOfPeople,
    })
    .from(scheduledTours)
    .innerJoin(tours, eq(scheduledTours.tourId, tours.id))
    .where(
      and(
        gte(scheduledTours.tourDate, today),
        ne(scheduledTours.status, "cancelled"),
      ),
    )
    .orderBy(asc(scheduledTours.tourDate))
    .limit(limit);

  if (upcomingTours.length === 0) {
    return [];
  }

  const tourIds = upcomingTours.map((tour) => tour.id);

  const assignedGuides = await db
    .select({
      scheduledTourId: scheduledTourGuides.scheduledTourId,
      guideFirstName: users.firstName,
      guideLastName: users.lastName,
      guideClerkId: users.clerkId,
    })
    .from(scheduledTourGuides)
    .innerJoin(guides, eq(guides.id, scheduledTourGuides.guideId))
    .innerJoin(users, eq(users.id, guides.userId))
    .where(inArray(scheduledTourGuides.scheduledTourId, tourIds));

  const guidesByTourId = new Map(
    assignedGuides.map((guide) => [guide.scheduledTourId, guide]),
  );

  return upcomingTours.map((tour) => {
    const guide = guidesByTourId.get(tour.id);

    return {
      ...tour,
      guideFirstName: guide?.guideFirstName ?? null,
      guideLastName: guide?.guideLastName ?? null,
      guideClerkId: guide?.guideClerkId ?? null,
    };
  });
}
