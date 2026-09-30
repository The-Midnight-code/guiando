import { sql } from "drizzle-orm";
import { check, numeric, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";

import { scheduledTours } from "./scheduledTours";

export const tourFinancials = pgTable(
  "tour_financials",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    scheduledTourId: uuid("scheduled_tour_id")
      .notNull()
      .unique()
      .references(() => scheduledTours.id, {
        onDelete: "cascade",
      }),

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
  },
  (table) => [
    check(
      "tour_financials_total_payment_usd_non_negative",
      sql`${table.totalPaymentUsd} >= 0`,
    ),

    check(
      "tour_financials_guide_cost_mxn_non_negative",
      sql`${table.guideCostMxn} >= 0`,
    ),

    check(
      "tour_financials_transportation_cost_mxn_non_negative",
      sql`${table.transportationCostMxn} >= 0`,
    ),

    check(
      "tour_financials_travelers_cost_mxn_non_negative",
      sql`${table.travelersCostMxn} >= 0`,
    ),

    check(
      "tour_financials_total_travelers_cost_mxn_non_negative",
      sql`${table.totalTravelersCostMxn} >= 0`,
    ),

    check(
      "tour_financials_extra_expenses_mxn_non_negative",
      sql`${table.extraExpensesMxn} >= 0`,
    ),

    check(
      "tour_financials_total_cost_mxn_non_negative",
      sql`${table.totalCostMxn} >= 0`,
    ),

    check(
      "tour_financials_total_cost_usd_non_negative",
      sql`${table.totalCostUsd} >= 0`,
    ),

    check(
      "tour_financials_exchange_rate_positive",
      sql`${table.exchangeRate} > 0`,
    ),
  ],
);
