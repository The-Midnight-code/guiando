import {
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import { tours } from "./tours";

export const tourPhotos = pgTable(
  "tour_photos",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    tourId: uuid("tour_id")
      .notNull()
      .references(() => tours.id, { onDelete: "cascade" }),

    url: text("url").notNull(),

    alt: text("alt"),

    sortOrder: integer("sort_order").default(0).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [unique("tour_photo_unique").on(table.tourId, table.url)],
);
