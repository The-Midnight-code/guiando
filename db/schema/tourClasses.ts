import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const tourClasses = pgTable("tour_classes", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: text("name").notNull().unique(),

  description: text("description"),

  active: boolean("active").default(true).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
