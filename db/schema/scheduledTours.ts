import {
  date,
  integer,
  numeric,
  pgTable,
  text,
  time,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { pickupLocations } from "./pickupLocations";
import { tours } from "./tours";
import { affiliates } from "./affiliates";
import { paymentTypes } from "./paymentTypes";

export const scheduledTours = pgTable("scheduled_tours", {
  id: uuid("id").defaultRandom().primaryKey(),

  tourId: uuid("tour_id")
    .notNull()
    .references(() => tours.id),

  // Original ID from the Tour Log
  externalId: integer("external_id").unique(),

  status: text("status").notNull(),

  // Date when the reservation/record was created
  bookingDate: date("booking_date"),

  // Date when the tour actually takes place
  tourDate: date("tour_date").notNull(),

  pickupLocationId: uuid("pickup_location_id")
    .notNull()
    .references(() => pickupLocations.id),

  affiliateId: uuid("affiliate_id").references(() => affiliates.id),

  paymentTypeId: uuid("payment_type_id").references(() => paymentTypes.id),

  startTime: time("start_time"),

  endTime: time("end_time"),

  locationStart: text("location_start"),

  locationEnd: text("location_end"),

  numberOfPeople: integer("number_of_people"),

  specialIndications: text("special_indications"),

  tip: numeric("tip", {
    precision: 10,
    scale: 2,
  }),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
