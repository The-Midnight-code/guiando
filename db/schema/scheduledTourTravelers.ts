import { pgTable, timestamp, unique, uuid } from "drizzle-orm/pg-core";

import { scheduledTours } from "./scheduledTours";
import { travelers } from "./travelers";

export const scheduledTourTravelers = pgTable(
  "scheduled_tour_travelers",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    scheduledTourId: uuid("scheduled_tour_id")
      .notNull()
      .references(() => scheduledTours.id, { onDelete: "cascade" }),

    travelerId: uuid("traveler_id")
      .notNull()
      .references(() => travelers.id, { onDelete: "cascade" }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    unique("scheduled_tour_traveler_unique").on(
      table.scheduledTourId,
      table.travelerId,
    ),
  ],
);
