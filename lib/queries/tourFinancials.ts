import { db } from "@/db/db";
import { eq } from "drizzle-orm";

import { scheduledTours, tourFinancials } from "@/db/schema";

export async function getFinancialsForScheduledTour(externalId: number) {
  const scheduledTour = await db.query.scheduledTours.findFirst({
    where: {
      externalId,
    },
  });

  if (!scheduledTour) {
    return null;
  }

  return db.query.tourFinancials.findFirst({
    where: {
      scheduledTourId: scheduledTour.id,
    },
  });
}

export interface UpsertTourFinancialsInput {
  totalPaymentUsd?: string;
  guideCostMxn?: string;
  transportationCostMxn?: string;
  travelersCostMxn?: string;
  totalTravelersCostMxn?: string;
  extraExpensesMxn?: string;
  totalCostMxn?: string;
  totalCostUsd?: string;
  totalRevenueUsd?: string;
  revenuePercentage?: string;
  exchangeRate?: string;
}

export async function createTourFinancials(
  externalId: number,
  input: UpsertTourFinancialsInput,
) {
  const scheduledTour = await db.query.scheduledTours.findFirst({
    where: {
      externalId,
    },
  });

  if (!scheduledTour) {
    throw new Error("Scheduled tour not found.");
  }

  const [financials] = await db
    .insert(tourFinancials)
    .values({
      scheduledTourId: scheduledTour.id,
      totalPaymentUsd: input.totalPaymentUsd,
      guideCostMxn: input.guideCostMxn,
      transportationCostMxn: input.transportationCostMxn,
      travelersCostMxn: input.travelersCostMxn,
      totalTravelersCostMxn: input.totalTravelersCostMxn,
      extraExpensesMxn: input.extraExpensesMxn,
      totalCostMxn: input.totalCostMxn,
      totalCostUsd: input.totalCostUsd,
      totalRevenueUsd: input.totalRevenueUsd,
      revenuePercentage: input.revenuePercentage,
      exchangeRate: input.exchangeRate,
    })
    .returning();

  return financials;
}

export async function updateTourFinancials(
  externalId: number,
  input: UpsertTourFinancialsInput,
) {
  const scheduledTour = await db.query.scheduledTours.findFirst({
    where: {
      externalId,
    },
  });

  if (!scheduledTour) {
    throw new Error("Scheduled tour not found.");
  }

  const [financials] = await db
    .update(tourFinancials)
    .set({
      totalPaymentUsd: input.totalPaymentUsd,
      guideCostMxn: input.guideCostMxn,
      transportationCostMxn: input.transportationCostMxn,
      travelersCostMxn: input.travelersCostMxn,
      totalTravelersCostMxn: input.totalTravelersCostMxn,
      extraExpensesMxn: input.extraExpensesMxn,
      totalCostMxn: input.totalCostMxn,
      totalCostUsd: input.totalCostUsd,
      totalRevenueUsd: input.totalRevenueUsd,
      revenuePercentage: input.revenuePercentage,
      updatedAt: new Date(),
      exchangeRate: input.exchangeRate,
    })
    .where(eq(tourFinancials.scheduledTourId, scheduledTour.id))
    .returning();

  return financials;
}
