import { beforeEach, describe, expect, it } from "vitest";

import { eq } from "drizzle-orm";

import { db } from "@/db/db";
import { paymentTypes } from "@/db/schema";

import {
  createPaymentType,
  getActivePaymentTypes,
  getPaymentTypeById,
  getPaymentTypes,
  togglePaymentTypeActive,
  updatePaymentType,
} from "./paymentTypes";

describe("paymentTypes queries", () => {
  const paymentTypeName = `Integration Payment Type ${Date.now()}`;

  beforeEach(async () => {
    await db.delete(paymentTypes).where(eq(paymentTypes.name, paymentTypeName));
  });

  it("creates a payment type", async () => {
    const paymentType = await createPaymentType({
      name: paymentTypeName,
      description: "Integration test payment type",
      active: true,
    });

    try {
      expect(paymentType.id).toBeDefined();
      expect(paymentType.name).toBe(paymentTypeName);
      expect(paymentType.description).toBe("Integration test payment type");
      expect(paymentType.active).toBe(true);
    } finally {
      await db.delete(paymentTypes).where(eq(paymentTypes.id, paymentType.id));
    }
  });

  it("rejects an empty name", async () => {
    await expect(
      createPaymentType({
        name: "   ",
      }),
    ).rejects.toThrow("Payment type name is required.");
  });

  it("creates optional fields as undefined when omitted", async () => {
    const paymentType = await createPaymentType({
      name: paymentTypeName,
    });

    try {
      expect(paymentType.description).toBeNull();
      expect(paymentType.active).toBe(true);
    } finally {
      await db.delete(paymentTypes).where(eq(paymentTypes.id, paymentType.id));
    }
  });

  it("gets a payment type by ID", async () => {
    const paymentType = await createPaymentType({
      name: paymentTypeName,
    });

    try {
      const result = await getPaymentTypeById(paymentType.id);

      expect(result).toBeDefined();
      expect(result?.id).toBe(paymentType.id);
      expect(result?.name).toBe(paymentTypeName);
    } finally {
      await db.delete(paymentTypes).where(eq(paymentTypes.id, paymentType.id));
    }
  });

  it("returns undefined for a nonexistent payment type", async () => {
    const result = await getPaymentTypeById(
      "11111111-1111-4111-8111-111111111111",
    );

    expect(result).toBeUndefined();
  });

  it("rejects an invalid payment type ID", async () => {
    await expect(getPaymentTypeById("invalid-id")).rejects.toThrow(
      "Payment type ID must be a valid UUID.",
    );
  });

  it("updates a payment type", async () => {
    const paymentType = await createPaymentType({
      name: paymentTypeName,
    });

    try {
      const updated = await updatePaymentType(paymentType.id, {
        name: `${paymentTypeName} Updated`,
        description: "Updated description",
        active: false,
      });

      expect(updated).toBeDefined();
      expect(updated?.id).toBe(paymentType.id);
      expect(updated?.name).toBe(`${paymentTypeName} Updated`);
      expect(updated?.description).toBe("Updated description");
      expect(updated?.active).toBe(false);
    } finally {
      await db.delete(paymentTypes).where(eq(paymentTypes.id, paymentType.id));
    }
  });

  it("rejects updating with an empty name", async () => {
    const paymentType = await createPaymentType({
      name: paymentTypeName,
    });

    try {
      await expect(
        updatePaymentType(paymentType.id, {
          name: "   ",
        }),
      ).rejects.toThrow("Payment type name is required.");
    } finally {
      await db.delete(paymentTypes).where(eq(paymentTypes.id, paymentType.id));
    }
  });

  it("rejects updating with an invalid ID", async () => {
    await expect(
      updatePaymentType("invalid-id", {
        name: paymentTypeName,
      }),
    ).rejects.toThrow("Payment type ID must be a valid UUID.");
  });

  it("toggles a payment type inactive", async () => {
    const paymentType = await createPaymentType({
      name: paymentTypeName,
      active: true,
    });

    try {
      const updated = await togglePaymentTypeActive(paymentType.id, false);

      expect(updated).toBeDefined();
      expect(updated?.active).toBe(false);
    } finally {
      await db.delete(paymentTypes).where(eq(paymentTypes.id, paymentType.id));
    }
  });

  it("toggles a payment type active", async () => {
    const paymentType = await createPaymentType({
      name: paymentTypeName,
      active: false,
    });

    try {
      const updated = await togglePaymentTypeActive(paymentType.id, true);

      expect(updated).toBeDefined();
      expect(updated?.active).toBe(true);
    } finally {
      await db.delete(paymentTypes).where(eq(paymentTypes.id, paymentType.id));
    }
  });

  it("returns only active payment types", async () => {
    const activePaymentType = await createPaymentType({
      name: `AAA ${paymentTypeName}`,
      active: true,
    });

    const inactivePaymentType = await createPaymentType({
      name: `ZZZ ${paymentTypeName}`,
      active: false,
    });

    try {
      const activePaymentTypes = await getActivePaymentTypes();

      expect(
        activePaymentTypes.some((item) => item.id === activePaymentType.id),
      ).toBe(true);

      expect(
        activePaymentTypes.some((item) => item.id === inactivePaymentType.id),
      ).toBe(false);
    } finally {
      await db
        .delete(paymentTypes)
        .where(eq(paymentTypes.id, activePaymentType.id));

      await db
        .delete(paymentTypes)
        .where(eq(paymentTypes.id, inactivePaymentType.id));
    }
  });

  it("returns payment types ordered by name", async () => {
    const firstPaymentType = await createPaymentType({
      name: `AAA ${paymentTypeName}`,
      active: true,
    });

    const secondPaymentType = await createPaymentType({
      name: `ZZZ ${paymentTypeName}`,
      active: false,
    });

    try {
      const allPaymentTypes = await getPaymentTypes();

      const firstIndex = allPaymentTypes.findIndex(
        (item) => item.id === firstPaymentType.id,
      );

      const secondIndex = allPaymentTypes.findIndex(
        (item) => item.id === secondPaymentType.id,
      );

      expect(firstIndex).toBeGreaterThanOrEqual(0);
      expect(secondIndex).toBeGreaterThanOrEqual(0);
      expect(firstIndex).toBeLessThan(secondIndex);

      expect(allPaymentTypes[firstIndex].name).toBe(firstPaymentType.name);
      expect(allPaymentTypes[secondIndex].name).toBe(secondPaymentType.name);
    } finally {
      await db
        .delete(paymentTypes)
        .where(eq(paymentTypes.id, firstPaymentType.id));

      await db
        .delete(paymentTypes)
        .where(eq(paymentTypes.id, secondPaymentType.id));
    }
  });
});
