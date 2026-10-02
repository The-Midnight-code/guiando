import { describe, expect, it } from "vitest";

import {
  calculateFinancialValues,
  parseExchangeRate,
  parseNonNegativeNumber,
} from "./calculations";

describe("parseNonNegativeNumber", () => {
  it("returns zero for an undefined value", () => {
    expect(parseNonNegativeNumber(undefined, "Amount")).toBe(0);
  });

  it("returns zero for an empty value", () => {
    expect(parseNonNegativeNumber("   ", "Amount")).toBe(0);
  });

  it("parses a valid non-negative number", () => {
    expect(parseNonNegativeNumber("125.50", "Amount")).toBe(125.5);
  });

  it("rejects invalid numbers", () => {
    expect(() => parseNonNegativeNumber("abc", "Amount")).toThrow(
      "Amount must be a valid number.",
    );
  });

  it("rejects negative numbers", () => {
    expect(() => parseNonNegativeNumber("-10", "Amount")).toThrow(
      "Amount cannot be negative.",
    );
  });
});

describe("parseExchangeRate", () => {
  it("returns zero when no exchange rate is provided", () => {
    expect(parseExchangeRate(undefined)).toBe(0);
  });

  it("parses a valid exchange rate", () => {
    expect(parseExchangeRate("17.25")).toBe(17.25);
  });

  it("rejects invalid exchange rates", () => {
    expect(() => parseExchangeRate("abc")).toThrow(
      "Exchange rate must be a valid number.",
    );
  });

  it("rejects zero", () => {
    expect(() => parseExchangeRate("0")).toThrow(
      "Exchange rate must be greater than zero.",
    );
  });

  it("rejects negative exchange rates", () => {
    expect(() => parseExchangeRate("-17")).toThrow(
      "Exchange rate must be greater than zero.",
    );
  });
});

describe("calculateFinancialValues", () => {
  it("calculates the financial values correctly", () => {
    const result = calculateFinancialValues(
      {
        totalPaymentUsd: 500,
        guideCostMxn: 1000,
        transportationCostMxn: 500,
        travelersCostMxn: 100,
        extraExpensesMxn: 200,
        exchangeRate: 20,
      },
      3,
    );

    expect(result).toEqual({
      totalTravelersCostMxn: "300.00",
      totalCostMxn: "2000.00",
      totalCostUsd: "100.00",
      totalRevenueUsd: "400.00",
      revenuePercentage: "80.00",
    });
  });

  it("handles zero travelers", () => {
    const result = calculateFinancialValues(
      {
        totalPaymentUsd: 500,
        guideCostMxn: 1000,
        transportationCostMxn: 500,
        travelersCostMxn: 100,
        extraExpensesMxn: 200,
        exchangeRate: 20,
      },
      0,
    );

    expect(result.totalTravelersCostMxn).toBe("0.00");
    expect(result.totalCostMxn).toBe("1700.00");
    expect(result.totalCostUsd).toBe("85.00");
    expect(result.totalRevenueUsd).toBe("415.00");
    expect(result.revenuePercentage).toBe("83.00");
  });

  it("allows a negative revenue when costs exceed payment", () => {
    const result = calculateFinancialValues(
      {
        totalPaymentUsd: 100,
        guideCostMxn: 3000,
        transportationCostMxn: 1000,
        travelersCostMxn: 500,
        extraExpensesMxn: 500,
        exchangeRate: 20,
      },
      2,
    );

    expect(result.totalCostUsd).toBe("275.00");
    expect(result.totalRevenueUsd).toBe("-175.00");
    expect(result.revenuePercentage).toBe("-175.00");
  });

  it("returns zero revenue percentage when payment is zero", () => {
    const result = calculateFinancialValues(
      {
        totalPaymentUsd: 0,
        guideCostMxn: 1000,
        transportationCostMxn: 500,
        travelersCostMxn: 100,
        extraExpensesMxn: 200,
        exchangeRate: 20,
      },
      2,
    );

    expect(result.totalRevenueUsd).toBe("-95.00");
    expect(result.revenuePercentage).toBe("0.00");
  });

  it("returns zero USD cost when the exchange rate is zero", () => {
    const result = calculateFinancialValues(
      {
        totalPaymentUsd: 500,
        guideCostMxn: 1000,
        transportationCostMxn: 500,
        travelersCostMxn: 100,
        extraExpensesMxn: 200,
        exchangeRate: 0,
      },
      2,
    );

    expect(result.totalCostMxn).toBe("1900.00");
    expect(result.totalCostUsd).toBe("0.00");
    expect(result.totalRevenueUsd).toBe("500.00");
    expect(result.revenuePercentage).toBe("100.00");
  });
});
