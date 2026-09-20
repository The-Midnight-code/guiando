import { defineRelations } from "drizzle-orm";

import { users } from "./users";
import { guides } from "./guides";
import { tourTypes } from "./tourTypes";
import { tourClasses } from "./tourClasses";
import { pickupLocations } from "./pickupLocations";
import { affiliates } from "./affiliates";
import { paymentTypes } from "./paymentTypes";
import { tours } from "./tours";
import { tourPhotos } from "./tourPhotos";
import { scheduledTours } from "./scheduledTours";
import { scheduledTourGuides } from "./scheduledTourGuides";
import { travelers } from "./travelers";
import { scheduledTourTravelers } from "./scheduledTourTravelers";
import { tourFinancials } from "./tourFinancials";

export const relations = defineRelations(
  {
    users,
    guides,
    tourTypes,
    tourClasses,
    pickupLocations,
    affiliates,
    paymentTypes,
    tours,
    tourPhotos,
    scheduledTours,
    scheduledTourGuides,
    travelers,
    scheduledTourTravelers,
    tourFinancials,
  },
  (r) => ({
    users: {
      guide: r.one.guides({
        from: r.users.id,
        to: r.guides.userId,
      }),
    },

    guides: {
      user: r.one.users({
        from: r.guides.userId,
        to: r.users.id,
      }),

      scheduledTourAssignments: r.many.scheduledTourGuides({
        from: r.guides.id,
        to: r.scheduledTourGuides.guideId,
      }),
    },

    tourTypes: {
      tours: r.many.tours({
        from: r.tourTypes.id,
        to: r.tours.tourTypeId,
      }),
    },

    tourClasses: {
      tours: r.many.tours({
        from: r.tourClasses.id,
        to: r.tours.tourClassId,
      }),
    },

    pickupLocations: {
      scheduledTours: r.many.scheduledTours({
        from: r.pickupLocations.id,
        to: r.scheduledTours.pickupLocationId,
      }),
    },

    affiliates: {
      scheduledTours: r.many.scheduledTours({
        from: r.affiliates.id,
        to: r.scheduledTours.affiliateId,
      }),
    },

    paymentTypes: {
      scheduledTours: r.many.scheduledTours({
        from: r.paymentTypes.id,
        to: r.scheduledTours.paymentTypeId,
      }),
    },

    tours: {
      tourType: r.one.tourTypes({
        from: r.tours.tourTypeId,
        to: r.tourTypes.id,
      }),

      tourClass: r.one.tourClasses({
        from: r.tours.tourClassId,
        to: r.tourClasses.id,
      }),

      photos: r.many.tourPhotos({
        from: r.tours.id,
        to: r.tourPhotos.tourId,
      }),

      scheduledTours: r.many.scheduledTours({
        from: r.tours.id,
        to: r.scheduledTours.tourId,
      }),
    },

    tourPhotos: {
      tour: r.one.tours({
        from: r.tourPhotos.tourId,
        to: r.tours.id,
      }),
    },

    scheduledTours: {
      tour: r.one.tours({
        from: r.scheduledTours.tourId,
        to: r.tours.id,
      }),

      pickupLocation: r.one.pickupLocations({
        from: r.scheduledTours.pickupLocationId,
        to: r.pickupLocations.id,
      }),

      affiliate: r.one.affiliates({
        from: r.scheduledTours.affiliateId,
        to: r.affiliates.id,
      }),

      paymentType: r.one.paymentTypes({
        from: r.scheduledTours.paymentTypeId,
        to: r.paymentTypes.id,
      }),

      guideAssignments: r.many.scheduledTourGuides({
        from: r.scheduledTours.id,
        to: r.scheduledTourGuides.scheduledTourId,
      }),

      travelerAssignments: r.many.scheduledTourTravelers({
        from: r.scheduledTours.id,
        to: r.scheduledTourTravelers.scheduledTourId,
      }),

      financials: r.one.tourFinancials({
        from: r.scheduledTours.id,
        to: r.tourFinancials.scheduledTourId,
      }),
    },

    scheduledTourGuides: {
      scheduledTour: r.one.scheduledTours({
        from: r.scheduledTourGuides.scheduledTourId,
        to: r.scheduledTours.id,
      }),

      guide: r.one.guides({
        from: r.scheduledTourGuides.guideId,
        to: r.guides.id,
      }),
    },

    travelers: {
      scheduledTourAssignments: r.many.scheduledTourTravelers({
        from: r.travelers.id,
        to: r.scheduledTourTravelers.travelerId,
      }),
    },

    scheduledTourTravelers: {
      scheduledTour: r.one.scheduledTours({
        from: r.scheduledTourTravelers.scheduledTourId,
        to: r.scheduledTours.id,
      }),

      traveler: r.one.travelers({
        from: r.scheduledTourTravelers.travelerId,
        to: r.travelers.id,
      }),
    },

    tourFinancials: {
      scheduledTour: r.one.scheduledTours({
        from: r.tourFinancials.scheduledTourId,
        to: r.scheduledTours.id,
      }),
    },
  }),
);
