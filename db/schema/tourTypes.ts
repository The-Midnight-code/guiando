import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db/db";

export const tourTypes = pgTable("tour_types", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: text("name").notNull().unique(),

  description: text("description"),

  active: boolean("active").default(true).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export async function getActiveTourTypes() {
  return db
    .select({
      id: tourTypes.id,
      name: tourTypes.name,
    })
    .from(tourTypes)
    .where(eq(tourTypes.active, true))
    .orderBy(asc(tourTypes.name));
}
