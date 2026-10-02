import { db } from "@/db/db";
import {
  calculateFinancialValues,
  parseExchangeRate,
  parseNonNegativeNumber,
  type FinancialValues,
} from "@/lib/financials/calculations";

import { count, eq } from "drizzle-orm";

import {
  scheduledTourTravelers,
  scheduledTours,
  tourFinancials,
} from "@/db/schema";

export interface UpsertTourFinancialsInput {
  totalPaymentUsd?: string;
  guideCostMxn?: string;
  transportationCostMxn?: string;
  travelersCostMxn?: string;
  extraExpensesMxn?: string;
  exchangeRate?: string;
}

function validateExternalId(externalId: number): void {
  if (!Number.isInteger(externalId) || externalId <= 0) {
    throw new Error("Scheduled tour ID must be a positive integer.");
  }
}

async function getScheduledTourFinancialContext(externalId: number) {
  validateExternalId(externalId);

  const [scheduledTour, travelerCount] = await Promise.all([
    db.query.scheduledTours.findFirst({
      where: {
        externalId,
      },
    }),

    db
      .select({
        count: count(),
      })
      .from(scheduledTourTravelers)
      .innerJoin(
        scheduledTours,
        eq(scheduledTours.id, scheduledTourTravelers.scheduledTourId),
      )
      .where(eq(scheduledTours.externalId, externalId)),
  ]);

  if (!scheduledTour) {
    throw new Error("Scheduled tour not found.");
  }

  return {
    scheduledTour,
    numberOfPeople: Number(travelerCount[0]?.count ?? 0),
  };
}

function validateFinancialInput(
  input: UpsertTourFinancialsInput,
): FinancialValues {
  return {
    totalPaymentUsd: parseNonNegativeNumber(
      input.totalPaymentUsd,
      "Total payment",
    ),

    guideCostMxn: parseNonNegativeNumber(input.guideCostMxn, "Guide cost"),

    transportationCostMxn: parseNonNegativeNumber(
      input.transportationCostMxn,
      "Transportation cost",
    ),

    travelersCostMxn: parseNonNegativeNumber(
      input.travelersCostMxn,
      "Traveler cost",
    ),

    extraExpensesMxn: parseNonNegativeNumber(
      input.extraExpensesMxn,
      "Extra expenses",
    ),

    exchangeRate: parseExchangeRate(input.exchangeRate),
  };
}

export async function getFinancialsForScheduledTour(externalId: number) {
  validateExternalId(externalId);

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

export async function createTourFinancials(
  externalId: number,
  input: UpsertTourFinancialsInput,
) {
  const { scheduledTour, numberOfPeople } =
    await getScheduledTourFinancialContext(externalId);

  const values = validateFinancialInput(input);

  const calculated = calculateFinancialValues(values, numberOfPeople);

  const [financials] = await db
    .insert(tourFinancials)
    .values({
      scheduledTourId: scheduledTour.id,

      totalPaymentUsd: values.totalPaymentUsd.toFixed(2),

      guideCostMxn: values.guideCostMxn.toFixed(2),

      transportationCostMxn: values.transportationCostMxn.toFixed(2),

      travelersCostMxn: values.travelersCostMxn.toFixed(2),

      totalTravelersCostMxn: calculated.totalTravelersCostMxn,

      extraExpensesMxn: values.extraExpensesMxn.toFixed(2),

      totalCostMxn: calculated.totalCostMxn,

      totalCostUsd: calculated.totalCostUsd,

      totalRevenueUsd: calculated.totalRevenueUsd,

      revenuePercentage: calculated.revenuePercentage,

      exchangeRate:
        values.exchangeRate > 0 ? values.exchangeRate.toFixed(4) : undefined,
    })
    .returning();

  return financials;
}

export async function updateTourFinancials(
  externalId: number,
  input: UpsertTourFinancialsInput,
) {
  const { scheduledTour, numberOfPeople } =
    await getScheduledTourFinancialContext(externalId);

  const values = validateFinancialInput(input);

  const calculated = calculateFinancialValues(values, numberOfPeople);

  const [financials] = await db
    .update(tourFinancials)
    .set({
      totalPaymentUsd: values.totalPaymentUsd.toFixed(2),

      guideCostMxn: values.guideCostMxn.toFixed(2),

      transportationCostMxn: values.transportationCostMxn.toFixed(2),

      travelersCostMxn: values.travelersCostMxn.toFixed(2),

      totalTravelersCostMxn: calculated.totalTravelersCostMxn,

      extraExpensesMxn: values.extraExpensesMxn.toFixed(2),

      totalCostMxn: calculated.totalCostMxn,

      totalCostUsd: calculated.totalCostUsd,

      totalRevenueUsd: calculated.totalRevenueUsd,

      revenuePercentage: calculated.revenuePercentage,

      exchangeRate:
        values.exchangeRate > 0 ? values.exchangeRate.toFixed(4) : undefined,

      updatedAt: new Date(),
    })
    .where(eq(tourFinancials.scheduledTourId, scheduledTour.id))
    .returning();

  return financials;
}
