import { numeric, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";

import { scheduledTours } from "./scheduledTours";

export const tourFinancials = pgTable("tour_financials", {
  id: uuid("id").defaultRandom().primaryKey(),

  scheduledTourId: uuid("scheduled_tour_id")
    .notNull()
    .unique()
    .references(() => scheduledTours.id, { onDelete: "cascade" }),

  totalPaymentUsd: numeric("total_payment_usd", {
    precision: 12,
    scale: 2,
  }),

  guideCostMxn: numeric("guide_cost_mxn", {
    precision: 12,
    scale: 2,
  }),

  transportationCostMxn: numeric("transportation_cost_mxn", {
    precision: 12,
    scale: 2,
  }),

  travelersCostMxn: numeric("travelers_cost_mxn", {
    precision: 12,
    scale: 2,
  }),

  totalTravelersCostMxn: numeric("total_travelers_cost_mxn", {
    precision: 12,
    scale: 2,
  }),

  extraExpensesMxn: numeric("extra_expenses_mxn", {
    precision: 12,
    scale: 2,
  }),

  totalCostMxn: numeric("total_cost_mxn", {
    precision: 12,
    scale: 2,
  }),

  totalCostUsd: numeric("total_cost_usd", {
    precision: 12,
    scale: 2,
  }),

  totalRevenueUsd: numeric("total_revenue_usd", {
    precision: 12,
    scale: 2,
  }),

  revenuePercentage: numeric("revenue_percentage", {
    precision: 7,
    scale: 2,
  }),

  exchangeRate: numeric("exchange_rate", {
    precision: 10,
    scale: 4,
  }),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
