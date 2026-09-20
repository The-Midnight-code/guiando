import { boolean, pgTable, timestamp, uuid, text } from "drizzle-orm/pg-core";
import { users } from "./users";

export const guides = pgTable("guides", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),

  phone: text("phone"),

  active: boolean("active").default(true).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
