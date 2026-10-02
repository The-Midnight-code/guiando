import { and, asc, eq, gte, lte, sql } from "drizzle-orm";

import { db } from "@/db/db";
import { scheduledTours, tourFinancials, tours } from "@/db/schema";
import {
  validateDate,
  validatePagination,
  validateUuid,
} from "@/lib/validation/common";

export type FinancialReportFilters = {
  startDate: string;
  endDate: string;
  tourId?: string;
  tourTypeId?: string;
  status?: string;
};

function buildFinancialReportConditions(filters: FinancialReportFilters) {
  validateDate(filters.startDate, "Start date");
  validateDate(filters.endDate, "End date");

  if (filters.startDate > filters.endDate) {
    throw new Error("Start date cannot be later than end date.");
  }

  if (filters.tourId) {
    validateUuid(filters.tourId, "Tour ID");
  }

  if (filters.tourTypeId) {
    validateUuid(filters.tourTypeId, "Tour type ID");
  }

  return [
    gte(scheduledTours.tourDate, filters.startDate),
    lte(scheduledTours.tourDate, filters.endDate),
    ...(filters.tourId ? [eq(scheduledTours.tourId, filters.tourId)] : []),
    ...(filters.tourTypeId ? [eq(tours.tourTypeId, filters.tourTypeId)] : []),
    ...(filters.status ? [eq(scheduledTours.status, filters.status)] : []),
  ];
}

export async function getFinancialReportRows(
  filters: FinancialReportFilters,
  page = 1,
  pageSize = 20,
) {
  validatePagination(page, pageSize);

  const conditions = buildFinancialReportConditions(filters);

  const offset = (page - 1) * pageSize;

  const [rows, totalResult, summaryResult] = await Promise.all([
    // query rows
    db
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
      .where(and(...conditions))
      .orderBy(asc(scheduledTours.tourDate))
      .limit(pageSize)
      .offset(offset),

    db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(tourFinancials)
      .innerJoin(
        scheduledTours,
        eq(tourFinancials.scheduledTourId, scheduledTours.id),
      )
      .innerJoin(tours, eq(scheduledTours.tourId, tours.id))
      .where(and(...conditions)),

    db
      .select({
        totalPayments: sql<string>`coalesce(sum(${tourFinancials.totalPaymentUsd}), 0)`,
        totalCost: sql<string>`coalesce(sum(${tourFinancials.totalCostUsd}), 0)`,
        totalRevenue: sql<string>`coalesce(sum(${tourFinancials.totalRevenueUsd}), 0)`,
        totalPeople: sql<string>`coalesce(sum(${scheduledTours.numberOfPeople}), 0)`,
      })
      .from(tourFinancials)
      .innerJoin(
        scheduledTours,
        eq(tourFinancials.scheduledTourId, scheduledTours.id),
      )
      .innerJoin(tours, eq(scheduledTours.tourId, tours.id))
      .where(and(...conditions)),
  ]);

  const total = Number(totalResult[0]?.count ?? 0);

  const summary = {
    totalPayments: Number(summaryResult[0]?.totalPayments ?? 0),
    totalCost: Number(summaryResult[0]?.totalCost ?? 0),
    totalRevenue: Number(summaryResult[0]?.totalRevenue ?? 0),
    totalPeople: Number(summaryResult[0]?.totalPeople ?? 0),
  };

  return {
    rows,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    summary,
  };
}

export async function getFinancialReportExportRows(
  filters: FinancialReportFilters,
) {
  const conditions = buildFinancialReportConditions(filters);

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
    .where(and(...conditions))
    .orderBy(asc(scheduledTours.tourDate));
}
