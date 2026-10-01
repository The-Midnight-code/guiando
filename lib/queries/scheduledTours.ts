import { db } from "@/db/db";
import { and, asc, count, desc, eq, exists, ilike, or, sql } from "drizzle-orm";
import {
  affiliates,
  guides,
  paymentTypes,
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
  specialIndications?: string;
  tip?: string;
}

function isValidUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function validateUuid(value: string, fieldName: string): void {
  if (!isValidUuid(value)) {
    throw new Error(`${fieldName} must be a valid UUID.`);
  }
}

function validateDate(
  value: string | undefined,
  fieldName: string,
  required = false,
): void {
  if (!value) {
    if (required) {
      throw new Error(`${fieldName} is required.`);
    }

    return;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`${fieldName} must be a valid date.`);
  }

  const date = new Date(`${value}T00:00:00Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    throw new Error(`${fieldName} must be a valid date.`);
  }
}

function validateTime(value: string | undefined, fieldName: string): void {
  if (!value) {
    return;
  }

  if (!/^\d{2}:\d{2}$/.test(value)) {
    throw new Error(`${fieldName} must be a valid time.`);
  }

  const [hours, minutes] = value.split(":").map(Number);

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error(`${fieldName} must be a valid time.`);
  }
}

function validateExternalId(value: number | undefined, required = false): void {
  if (value === undefined) {
    if (required) {
      throw new Error("External ID is required.");
    }

    return;
  }

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error("External ID must be a positive integer.");
  }
}

function validateTip(value: string | undefined): void {
  if (!value || value.trim() === "") {
    return;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error("Tip must be a valid non-negative number.");
  }
}

function validateScheduledTourInput(input: CreateScheduledTourInput): void {
  validateUuid(input.tourId, "Tour ID");
  validateUuid(input.pickupLocationId, "Pickup location ID");

  if (input.affiliateId) {
    validateUuid(input.affiliateId, "Affiliate ID");
  }

  if (input.paymentTypeId) {
    validateUuid(input.paymentTypeId, "Payment type ID");
  }

  if (!input.status.trim()) {
    throw new Error("Status is required.");
  }

  validateExternalId(input.externalId);
  validateDate(input.bookingDate, "Booking date");
  validateDate(input.tourDate, "Tour date", true);

  validateTime(input.startTime, "Start time");
  validateTime(input.endTime, "End time");

  if (input.startTime && input.endTime && input.endTime < input.startTime) {
    throw new Error("End time cannot be earlier than start time.");
  }

  validateTip(input.tip);
}

async function validateScheduledTourReferences(
  input: CreateScheduledTourInput,
): Promise<void> {
  const [tour, pickupLocation, affiliate, paymentType] = await Promise.all([
    db.query.tours.findFirst({
      where: { id: input.tourId },
    }),

    db.query.pickupLocations.findFirst({
      where: { id: input.pickupLocationId },
    }),

    input.affiliateId
      ? db.query.affiliates.findFirst({
          where: { id: input.affiliateId },
        })
      : Promise.resolve(null),

    input.paymentTypeId
      ? db.query.paymentTypes.findFirst({
          where: { id: input.paymentTypeId },
        })
      : Promise.resolve(null),
  ]);

  if (!tour) {
    throw new Error("Tour not found.");
  }

  if (!pickupLocation) {
    throw new Error("Pickup location not found.");
  }

  if (input.affiliateId && !affiliate) {
    throw new Error("Affiliate not found.");
  }

  if (input.paymentTypeId && !paymentType) {
    throw new Error("Payment type not found.");
  }
}

async function validateExternalIdIsAvailable(
  externalId: number | undefined,
): Promise<void> {
  if (externalId === undefined) {
    return;
  }

  const existingTour = await db.query.scheduledTours.findFirst({
    where: {
      externalId,
    },
  });

  if (existingTour) {
    throw new Error("A scheduled tour with this external ID already exists.");
  }
}

export async function createScheduledTour(input: CreateScheduledTourInput) {
  validateScheduledTourInput(input);
  await validateScheduledTourReferences(input);
  await validateExternalIdIsAvailable(input.externalId);

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
  validateExternalId(externalId, true);
  validateScheduledTourInput(input);
  await validateScheduledTourReferences(input);

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
      specialIndications: input.specialIndications,
      tip: input.tip,
      updatedAt: new Date(),
    })
    .where(eq(scheduledTours.externalId, externalId))
    .returning();

  return scheduledTour;
}

export async function deleteScheduledTour(externalId: number) {
  if (!Number.isInteger(externalId) || externalId <= 0) {
    throw new Error("External ID must be a positive integer.");
  }

  const scheduledTour = await db.query.scheduledTours.findFirst({
    where: {
      externalId,
    },
    with: {
      financials: true,
    },
  });

  if (!scheduledTour) {
    return undefined;
  }

  if (scheduledTour.financials) {
    throw new Error(
      "Scheduled tours with financial records cannot be deleted.",
    );
  }

  const [deletedScheduledTour] = await db
    .delete(scheduledTours)
    .where(eq(scheduledTours.id, scheduledTour.id))
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

export async function getScheduledTourByUuid(id: string, userId: string) {
  validateUuid(id, "Scheduled tour ID");
  validateUuid(userId, "User ID");
  return db.query.scheduledTours.findFirst({
    where: {
      id,
      guideAssignments: {
        guide: {
          userId,
        },
      },
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
      travelerAssignments: {
        with: {
          traveler: true,
        },
      },
    },
  });
}

export async function completeScheduledTour(id: string, userId: string) {
  validateUuid(id, "Scheduled tour ID");
  validateUuid(userId, "User ID");

  const [updatedTour] = await db
    .update(scheduledTours)
    .set({
      status: "COMPLETED",
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(scheduledTours.id, id),
        or(
          eq(scheduledTours.status, "PENDING"),
          eq(scheduledTours.status, "CONFIRMED"),
        ),
        exists(
          db
            .select({ id: scheduledTourGuides.id })
            .from(scheduledTourGuides)
            .innerJoin(guides, eq(guides.id, scheduledTourGuides.guideId))
            .where(
              and(
                eq(scheduledTourGuides.scheduledTourId, scheduledTours.id),
                eq(guides.userId, userId),
              ),
            ),
        ),
      ),
    )
    .returning();

  return updatedTour ?? null;
}
