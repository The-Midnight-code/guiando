import { db } from "@/db/db";
import {
  and,
  asc,
  count,
  desc,
  eq,
  exists,
  ilike,
  inArray,
  or,
  sql,
} from "drizzle-orm";
import {
  guides,
  pickupLocations,
  scheduledTourGuides,
  scheduledTours,
  tours,
  users,
} from "@/db/schema";

export interface GetScheduledToursForAdminParams {
  search?: string;
  status?: string;
  date?: string;
  sortBy?: "date" | "startTime" | "tour" | "status" | "guide";
  sortDirection?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export async function getScheduledTours() {
  return db.query.scheduledTours.findMany({
    with: {
      tour: {
        with: {
          tourType: true,
          tourClass: true,
          photos: true,
        },
      },
      pickupLocation: true,
      affiliate: true,
      paymentType: true,
      guideAssignments: {
        with: {
          guide: {
            with: {
              user: true,
            },
          },
        },
      },
      travelerAssignments: {
        with: {
          traveler: true,
        },
      },
      financials: true,
    },
  });
}

export async function getScheduledToursForAdmin({
  search = "",
  status = "all",
  date = "",
  sortBy = "date",
  sortDirection = "asc",
  page = 1,
  pageSize = 20,
}: GetScheduledToursForAdminParams = {}) {
  const normalizedSearch = search.trim();

  const conditions = [];

  if (status !== "all") {
    conditions.push(eq(scheduledTours.status, status));
  }

  if (date) {
    conditions.push(eq(scheduledTours.tourDate, date));
  }

  if (normalizedSearch) {
    const searchTerm = `%${normalizedSearch}%`;

    conditions.push(
      or(
        exists(
          db
            .select({ id: tours.id })
            .from(tours)
            .where(
              and(
                eq(tours.id, scheduledTours.tourId),
                ilike(tours.name, searchTerm),
              ),
            ),
        ),

        exists(
          db
            .select({ id: pickupLocations.id })
            .from(pickupLocations)
            .where(
              and(
                eq(pickupLocations.id, scheduledTours.pickupLocationId),
                ilike(pickupLocations.name, searchTerm),
              ),
            ),
        ),

        ilike(scheduledTours.status, searchTerm),

        exists(
          db
            .select({ id: scheduledTourGuides.id })
            .from(scheduledTourGuides)
            .innerJoin(guides, eq(guides.id, scheduledTourGuides.guideId))
            .innerJoin(users, eq(users.id, guides.userId))
            .where(
              and(
                eq(scheduledTourGuides.scheduledTourId, scheduledTours.id),
                or(
                  ilike(users.firstName, searchTerm),
                  ilike(users.lastName, searchTerm),
                ),
              ),
            ),
        ),
      ),
    );
  }

  const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

  const offset = (page - 1) * pageSize;

  const orderColumn =
    sortBy === "date"
      ? scheduledTours.tourDate
      : sortBy === "startTime"
        ? scheduledTours.startTime
        : sortBy === "status"
          ? scheduledTours.status
          : scheduledTours.tourDate;

  const orderDirection = sortDirection === "desc" ? desc : asc;

  const [pagedTours, totalResult] = await Promise.all([
    db
      .select({
        id: scheduledTours.id,
      })
      .from(scheduledTours)
      .leftJoin(tours, eq(tours.id, scheduledTours.tourId))
      .leftJoin(
        scheduledTourGuides,
        eq(scheduledTourGuides.scheduledTourId, scheduledTours.id),
      )
      .leftJoin(guides, eq(guides.id, scheduledTourGuides.guideId))
      .leftJoin(users, eq(users.id, guides.userId))
      .where(whereCondition)
      .groupBy(scheduledTours.id, tours.name)
      .orderBy(
        orderDirection(
          sortBy === "tour"
            ? tours.name
            : sortBy === "guide"
              ? sql<string>`
              min(
                lower(
                  concat(
                    coalesce(${users.firstName}, ''),
                    ' ',
                    coalesce(${users.lastName}, '')
                  )
                )
              )
            `
              : sortBy === "startTime"
                ? scheduledTours.startTime
                : sortBy === "status"
                  ? scheduledTours.status
                  : scheduledTours.tourDate,
        ),
      )
      .limit(pageSize)
      .offset(offset),

    db
      .select({
        count: count(),
      })
      .from(scheduledTours)
      .where(whereCondition),
  ]);

  const total = Number(totalResult[0]?.count ?? 0);

  if (pagedTours.length === 0) {
    return {
      items: [],
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  const ids = pagedTours.map((tour) => tour.id);

  const items = await db.query.scheduledTours.findMany({
    where: {
      id: {
        in: ids,
      },
    },
    with: {
      tour: true,
      pickupLocation: true,
      affiliate: true,
      paymentType: true,
      guideAssignments: {
        with: {
          guide: {
            with: {
              user: true,
            },
          },
        },
      },
    },
  });

  const itemsById = new Map(items.map((item) => [item.id, item]));

  const orderedItems = ids
    .map((id) => itemsById.get(id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return {
    items: orderedItems,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };

  return {
    items,
    total: totalResult[0]?.count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil(Number(totalResult[0]?.count ?? 0) / pageSize),
  };
}

export async function getScheduledTourById(externalId: number) {
  return db.query.scheduledTours.findFirst({
    where: {
      externalId,
    },
    with: {
      tour: {
        with: {
          tourType: true,
          tourClass: true,
          photos: true,
        },
      },
      pickupLocation: true,
      affiliate: true,
      paymentType: true,
      guideAssignments: {
        with: {
          guide: {
            with: {
              user: true,
            },
          },
        },
      },
      travelerAssignments: {
        with: {
          traveler: true,
        },
      },
      financials: true,
    },
  });
}

export interface CreateScheduledTourInput {
  tourId: string;
  externalId?: number;
  status: string;
  bookingDate?: string;
  tourDate: string;
  pickupLocationId: string;
  affiliateId?: string;
  paymentTypeId?: string;
  startTime?: string;
  endTime?: string;
  locationStart?: string;
  locationEnd?: string;
  numberOfPeople?: number;
  specialIndications?: string;
  tip?: string;
}

export async function createScheduledTour(input: CreateScheduledTourInput) {
  const [scheduledTour] = await db
    .insert(scheduledTours)
    .values({
      tourId: input.tourId,
      externalId: input.externalId,
      status: input.status,
      bookingDate: input.bookingDate,
      tourDate: input.tourDate,
      pickupLocationId: input.pickupLocationId,
      affiliateId: input.affiliateId,
      paymentTypeId: input.paymentTypeId,
      startTime: input.startTime,
      endTime: input.endTime,
      locationStart: input.locationStart,
      locationEnd: input.locationEnd,
      numberOfPeople: input.numberOfPeople,
      specialIndications: input.specialIndications,
      tip: input.tip,
    })
    .returning();

  return scheduledTour;
}

export async function updateScheduledTour(
  externalId: number,
  input: CreateScheduledTourInput,
) {
  const [scheduledTour] = await db
    .update(scheduledTours)
    .set({
      tourId: input.tourId,
      status: input.status,
      bookingDate: input.bookingDate,
      tourDate: input.tourDate,
      pickupLocationId: input.pickupLocationId,
      affiliateId: input.affiliateId,
      paymentTypeId: input.paymentTypeId,
      startTime: input.startTime,
      endTime: input.endTime,
      locationStart: input.locationStart,
      locationEnd: input.locationEnd,
      numberOfPeople: input.numberOfPeople,
      specialIndications: input.specialIndications,
      tip: input.tip,
      updatedAt: new Date(),
    })
    .where(eq(scheduledTours.externalId, externalId))
    .returning();

  return scheduledTour;
}

export async function deleteScheduledTour(externalId: number) {
  const [deletedScheduledTour] = await db
    .delete(scheduledTours)
    .where(eq(scheduledTours.externalId, externalId))
    .returning();

  return deletedScheduledTour;
}

export async function getScheduledTourStatuses() {
  const rows = await db
    .selectDistinct({
      status: scheduledTours.status,
    })
    .from(scheduledTours)
    .orderBy(asc(scheduledTours.status));

  return rows.map((row) => row.status);
}
