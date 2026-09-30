import { db } from "@/db/db";

import { and, count, eq } from "drizzle-orm";

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

interface FinancialValues {
  totalPaymentUsd: number;
  guideCostMxn: number;
  transportationCostMxn: number;
  travelersCostMxn: number;
  extraExpensesMxn: number;
  exchangeRate: number;
}

function parseNonNegativeNumber(
  value: string | undefined,
  fieldName: string,
): number {
  if (value === undefined || value.trim() === "") {
    return 0;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    throw new Error(`${fieldName} must be a valid number.`);
  }

  if (parsed < 0) {
    throw new Error(`${fieldName} cannot be negative.`);
  }

  return parsed;
}

function parseExchangeRate(value: string | undefined): number {
  if (value === undefined || value.trim() === "") {
    return 0;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    throw new Error("Exchange rate must be a valid number.");
  }

  if (parsed <= 0) {
    throw new Error("Exchange rate must be greater than zero.");
  }

  return parsed;
}

function calculateFinancialValues(
  values: FinancialValues,
  numberOfPeople: number,
) {
  const totalTravelersCostMxn = values.travelersCostMxn * numberOfPeople;

  const totalCostMxn =
    values.guideCostMxn +
    values.transportationCostMxn +
    totalTravelersCostMxn +
    values.extraExpensesMxn;

  const totalCostUsd =
    values.exchangeRate > 0 ? totalCostMxn / values.exchangeRate : 0;

  const totalRevenueUsd = values.totalPaymentUsd - totalCostUsd;

  const revenuePercentage =
    values.totalPaymentUsd > 0
      ? (totalRevenueUsd / values.totalPaymentUsd) * 100
      : 0;

  return {
    totalTravelersCostMxn: totalTravelersCostMxn.toFixed(2),
    totalCostMxn: totalCostMxn.toFixed(2),
    totalCostUsd: totalCostUsd.toFixed(2),
    totalRevenueUsd: totalRevenueUsd.toFixed(2),
    revenuePercentage: revenuePercentage.toFixed(2),
  };
}

async function getScheduledTourFinancialContext(externalId: number) {
  if (!Number.isInteger(externalId)) {
    throw new Error("Invalid scheduled tour ID.");
  }

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
