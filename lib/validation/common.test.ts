import { describe, expect, it } from "vitest";

import {
  isValidUuid,
  validateDate,
  validatePagination,
  validateUuid,
} from "./common";

describe("isValidUuid", () => {
  it("returns true for a valid UUID", () => {
    expect(isValidUuid("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
  });

  it("returns false for an invalid UUID", () => {
    expect(isValidUuid("not-a-uuid")).toBe(false);
  });
});

describe("validateUuid", () => {
  it("accepts a valid UUID", () => {
    expect(() =>
      validateUuid("550e8400-e29b-41d4-a716-446655440000", "Tour ID"),
    ).not.toThrow();
  });

  it("rejects an invalid UUID", () => {
    expect(() => validateUuid("invalid", "Tour ID")).toThrow(
      "Tour ID must be a valid UUID.",
    );
  });
});

describe("validateDate", () => {
  it("accepts a valid date", () => {
    expect(() => validateDate("2026-10-02", "Start date")).not.toThrow();
  });

  it("rejects an invalid date format", () => {
    expect(() => validateDate("10/02/2026", "Start date")).toThrow(
      "Start date must be a valid date.",
    );
  });

  it("rejects an impossible date", () => {
    expect(() => validateDate("2026-02-30", "Start date")).toThrow(
      "Start date must be a valid date.",
    );
  });
});

describe("validatePagination", () => {
  it("accepts valid pagination", () => {
    expect(() => validatePagination(1, 20)).not.toThrow();
  });

  it("rejects a page below one", () => {
    expect(() => validatePagination(0, 20)).toThrow(
      "Page must be a positive integer.",
    );
  });

  it("rejects a non-integer page", () => {
    expect(() => validatePagination(1.5, 20)).toThrow(
      "Page must be a positive integer.",
    );
  });

  it("rejects a page size below one", () => {
    expect(() => validatePagination(1, 0)).toThrow(
      "Page size must be between 1 and 10000.",
    );
  });

  it("rejects a page size above the maximum", () => {
    expect(() => validatePagination(1, 10001)).toThrow(
      "Page size must be between 1 and 10000.",
    );
  });
});
