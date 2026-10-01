import { asc, and, eq, gte, ne, or, ilike, SQL, count } from "drizzle-orm";

import { db } from "@/db/db";
import {
  guides,
  pickupLocations,
  scheduledTourGuides,
  scheduledTours,
  tours,
} from "@/db/schema";

import { clerkClient } from "@clerk/nextjs/server";

function validateUuid(value: string, fieldName: string): void {
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  ) {
    throw new Error(`${fieldName} must be a valid UUID.`);
  }
}

function validateLimit(limit: number): number {
  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error("Limit must be a positive integer.");
  }

  return Math.min(limit, 50);
}

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
  validateUuid(userId, "User ID");
  const today = new Date().toISOString().split("T")[0];
  const safeLimit = validateLimit(limit);

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
    .limit(safeLimit);
}

export async function getGuideScheduledTours(
  userId: string,
  status?: string,
  search?: string,
  page = 1,
  pageSize = 20,
) {
  validateUuid(userId, "User ID");

  if (!Number.isInteger(page) || page < 1) {
    throw new Error("Page must be a positive integer.");
  }

  const safePageSize = validateLimit(pageSize);
  const safePage = page;
  const offset = (safePage - 1) * safePageSize;

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

  const whereCondition = and(...conditions);

  const [items, totalResult] = await Promise.all([
    db
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
      .where(whereCondition)
      .orderBy(asc(scheduledTours.tourDate), asc(scheduledTours.startTime))
      .limit(safePageSize)
      .offset(offset),

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
      .innerJoin(tours, eq(tours.id, scheduledTours.tourId))
      .innerJoin(
        pickupLocations,
        eq(pickupLocations.id, scheduledTours.pickupLocationId),
      )
      .where(whereCondition),
  ]);

  const total = Number(totalResult[0]?.count ?? 0);
  const totalPages = Math.ceil(total / safePageSize);

  return {
    items,
    total,
    page: safePage,
    pageSize: safePageSize,
    totalPages,
  };
}

export async function getGuideDashboardStats(userId: string) {
  validateUuid(userId, "User ID");
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
          or(
            eq(scheduledTours.status, "PENDING"),
            eq(scheduledTours.status, "CONFIRMED"),
          ),
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

export async function getAdminGuides() {
  return db.query.guides.findMany({
    with: {
      user: true,
    },
    orderBy: (guides, { asc }) => [asc(guides.createdAt)],
  });
}

export async function getPendingGuideInvitations() {
  const client = await clerkClient();

  const { data } = await client.invitations.getInvitationList({
    status: "pending",
    limit: 100,
  });

  return data.filter(
    (invitation) => invitation.publicMetadata?.role === "GUIDE",
  );
}
