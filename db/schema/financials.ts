import { and, eq, gte, lte } from "drizzle-orm";

import { db } from "@/db/db";
import { scheduledTours, tourFinancials, tours } from "@/db/schema";

export type FinancialReportFilters = {
  startDate: string;
  endDate: string;
  tourId?: string;
  tourTypeId?: string;
  status?: string;
};

export async function getFinancialReportRows(filters: FinancialReportFilters) {
  const conditions = [
    gte(scheduledTours.tourDate, filters.startDate),
    lte(scheduledTours.tourDate, filters.endDate),
  ];

  if (filters.tourId) {
    conditions.push(eq(scheduledTours.tourId, filters.tourId));
  }

  if (filters.tourTypeId) {
    conditions.push(eq(tours.tourTypeId, filters.tourTypeId));
  }

  if (filters.status) {
    conditions.push(eq(scheduledTours.status, filters.status));
  }

  return db
    .select({
      scheduledTourId: scheduledTours.id,
      tourDate: scheduledTours.tourDate,
      status: scheduledTours.status,
      numberOfPeople: scheduledTours.numberOfPeople,

      tourName: tours.name,

      totalPaymentUsd: tourFinancials.totalPaymentUsd,
      guideCostMxn: tourFinancials.guideCostMxn,
      transportationCostMxn: tourFinancials.transportationCostMxn,
      travelersCostMxn: tourFinancials.travelersCostMxn,
      totalTravelersCostMxn: tourFinancials.totalTravelersCostMxn,
      extraExpensesMxn: tourFinancials.extraExpensesMxn,
      totalCostMxn: tourFinancials.totalCostMxn,
      totalCostUsd: tourFinancials.totalCostUsd,
      totalRevenueUsd: tourFinancials.totalRevenueUsd,
      revenuePercentage: tourFinancials.revenuePercentage,
      exchangeRate: tourFinancials.exchangeRate,
    })
    .from(tourFinancials)
    .innerJoin(
      scheduledTours,
      eq(tourFinancials.scheduledTourId, scheduledTours.id),
    )
    .innerJoin(tours, eq(scheduledTours.tourId, tours.id))
    .where(and(...conditions));
}
