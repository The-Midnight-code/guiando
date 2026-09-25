import { and, eq, gte, lte } from "drizzle-orm";

import { db } from "@/db/db";
import { scheduledTours, tourFinancials, tours } from "@/db/schema";

export async function getFinancialReportRows(
  startDate: string,
  endDate: string,
) {
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
    .where(
      and(
        gte(scheduledTours.tourDate, startDate),
        lte(scheduledTours.tourDate, endDate),
      ),
    );
}
