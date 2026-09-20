import { db } from "@/db/db";
import { eq } from "drizzle-orm";
import { scheduledTours } from "@/db/schema";

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

export async function getScheduledToursForAdmin() {
  return db.query.scheduledTours.findMany({
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
    orderBy: (scheduledTours, { asc }) => [
      asc(scheduledTours.tourDate),
      asc(scheduledTours.startTime),
    ],
  });
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
