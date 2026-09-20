import { db } from "@/db/db";

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
