import { index, pgTable, timestamp, unique, uuid } from "drizzle-orm/pg-core";

import { guides } from "./guides";
import { scheduledTours } from "./scheduledTours";

export const scheduledTourGuides = pgTable(
  "scheduled_tour_guides",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    scheduledTourId: uuid("scheduled_tour_id")
      .notNull()
      .references(() => scheduledTours.id, { onDelete: "cascade" }),

    guideId: uuid("guide_id")
      .notNull()
      .references(() => guides.id, { onDelete: "cascade" }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    unique("scheduled_tour_guide_unique").on(
      table.scheduledTourId,
      table.guideId,
    ),
    index("scheduled_tour_guides_guide_id_idx").on(table.guideId),
  ],
);
