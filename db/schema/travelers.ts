import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const travelers = pgTable("travelers", {
  id: uuid("id").defaultRandom().primaryKey(),

  firstName: text("first_name").notNull(),

  lastName: text("last_name"),

  email: text("email"),

  phone: text("phone"),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
