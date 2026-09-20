import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const pickupLocations = pgTable("pickup_locations", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: text("name").notNull().unique(),

  address: text("address").notNull(),

  instructions: text("instructions"),

  latitude: text("latitude"),

  longitude: text("longitude"),

  active: boolean("active").default(true).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
