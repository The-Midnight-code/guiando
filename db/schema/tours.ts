import {
  boolean,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { asc, eq, and } from "drizzle-orm";
import { db } from "@/db/db";

import { tourTypes } from "./tourTypes";
import { tourClasses } from "./tourClasses";

export const tours = pgTable("tours", {
  id: uuid("id").defaultRandom().primaryKey(),

  // Original PRODUCT ID from the Tour Log
  productId: text("product_id").unique(),

  name: text("name").notNull(),

  description: text("description"),

  duration: integer("duration"),

  price: numeric("price", {
    precision: 10,
    scale: 2,
  }),

  tourTypeId: uuid("tour_type_id")
    .notNull()
    .references(() => tourTypes.id),

  tourClassId: uuid("tour_class_id").references(() => tourClasses.id),

  active: boolean("active").default(true).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export async function getActiveTours(tourTypeId?: string) {
  const conditions = [eq(tours.active, true)];

  if (tourTypeId) {
    conditions.push(eq(tours.tourTypeId, tourTypeId));
  }

  return db
    .select({
      id: tours.id,
      name: tours.name,
    })
    .from(tours)
    .where(and(...conditions))
    .orderBy(asc(tours.name));
}
