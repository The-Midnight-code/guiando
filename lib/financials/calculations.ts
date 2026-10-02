export interface FinancialValues {
  totalPaymentUsd: number;
  guideCostMxn: number;
  transportationCostMxn: number;
  travelersCostMxn: number;
  extraExpensesMxn: number;
  exchangeRate: number;
}

export interface CalculatedFinancialValues {
  totalTravelersCostMxn: string;
  totalCostMxn: string;
  totalCostUsd: string;
  totalRevenueUsd: string;
  revenuePercentage: string;
}

export function parseNonNegativeNumber(
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

export function parseExchangeRate(value: string | undefined): number {
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

export function calculateFinancialValues(
  values: FinancialValues,
  numberOfPeople: number,
): CalculatedFinancialValues {
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
