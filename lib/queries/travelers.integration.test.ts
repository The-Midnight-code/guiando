import { beforeEach, describe, expect, it } from "vitest";

import { eq } from "drizzle-orm";

import { db } from "@/db/db";
import { travelers } from "@/db/schema";

import {
  createTraveler,
  getTravelerById,
  getTravelers,
  updateTraveler,
} from "./travelers";

describe("travelers queries", () => {
  const firstName = `Integration Traveler ${Date.now()}`;

  beforeEach(async () => {
    await db.delete(travelers).where(eq(travelers.firstName, firstName));
  });

  it("creates a traveler", async () => {
    const traveler = await createTraveler({
      firstName,
      lastName: "Test",
      email: "integration@example.com",
      phone: "6641234567",
    });

    try {
      expect(traveler.id).toBeDefined();
      expect(traveler.firstName).toBe(firstName);
      expect(traveler.lastName).toBe("Test");
      expect(traveler.email).toBe("integration@example.com");
      expect(traveler.phone).toBe("6641234567");
    } finally {
      await db.delete(travelers).where(eq(travelers.id, traveler.id));
    }
  });

  it("trims traveler fields", async () => {
    const traveler = await createTraveler({
      firstName: `  ${firstName}  `,
      lastName: "  Test  ",
      email: "  integration@example.com  ",
      phone: " 6641234567 ",
    });

    try {
      expect(traveler.firstName).toBe(firstName);
      expect(traveler.lastName).toBe("Test");
      expect(traveler.email).toBe("integration@example.com");
      expect(traveler.phone).toBe("6641234567");
    } finally {
      await db.delete(travelers).where(eq(travelers.id, traveler.id));
    }
  });

  it("rejects an empty first name", async () => {
    await expect(
      createTraveler({
        firstName: "   ",
      }),
    ).rejects.toThrow("First name is required.");
  });

  it("rejects a first name longer than 100 characters", async () => {
    await expect(
      createTraveler({
        firstName: "A".repeat(101),
      }),
    ).rejects.toThrow("First name is too long.");
  });

  it("rejects a last name longer than 100 characters", async () => {
    await expect(
      createTraveler({
        firstName,
        lastName: "A".repeat(101),
      }),
    ).rejects.toThrow("Last name is too long.");
  });

  it("rejects an email longer than 255 characters", async () => {
    await expect(
      createTraveler({
        firstName,
        email: `${"a".repeat(250)}@test.com`,
      }),
    ).rejects.toThrow("Email is too long.");
  });

  it("rejects an invalid email", async () => {
    await expect(
      createTraveler({
        firstName,
        email: "invalid-email",
      }),
    ).rejects.toThrow("Email must be valid.");
  });

  it("rejects a phone number longer than 30 characters", async () => {
    await expect(
      createTraveler({
        firstName,
        phone: "1".repeat(31),
      }),
    ).rejects.toThrow("Phone number is too long.");
  });

  it("creates a traveler without optional fields", async () => {
    const traveler = await createTraveler({
      firstName,
    });

    try {
      expect(traveler.lastName).toBeNull();
      expect(traveler.email).toBeNull();
      expect(traveler.phone).toBeNull();
    } finally {
      await db.delete(travelers).where(eq(travelers.id, traveler.id));
    }
  });

  it("gets a traveler by ID", async () => {
    const traveler = await createTraveler({
      firstName,
    });

    try {
      const result = await getTravelerById(traveler.id);

      expect(result).toBeDefined();
      expect(result?.id).toBe(traveler.id);
      expect(result?.firstName).toBe(firstName);
    } finally {
      await db.delete(travelers).where(eq(travelers.id, traveler.id));
    }
  });

  it("returns undefined for a nonexistent traveler", async () => {
    const result = await getTravelerById(
      "11111111-1111-4111-8111-111111111111",
    );

    expect(result).toBeUndefined();
  });
  it("rejects an invalid traveler ID", async () => {
    await expect(getTravelerById("invalid-id")).rejects.toThrow(
      "Traveler ID must be a valid UUID.",
    );
  });

  it("updates a traveler", async () => {
    const traveler = await createTraveler({
      firstName,
    });

    try {
      const updated = await updateTraveler(traveler.id, {
        firstName: `${firstName} Updated`,
        lastName: "Updated Last Name",
        email: "updated@example.com",
        phone: "6649876543",
      });

      expect(updated).toBeDefined();
      expect(updated?.id).toBe(traveler.id);
      expect(updated?.firstName).toBe(`${firstName} Updated`);
      expect(updated?.lastName).toBe("Updated Last Name");
      expect(updated?.email).toBe("updated@example.com");
      expect(updated?.phone).toBe("6649876543");
    } finally {
      await db.delete(travelers).where(eq(travelers.id, traveler.id));
    }
  });

  it("rejects updating with an invalid traveler ID", async () => {
    await expect(
      updateTraveler("invalid-id", {
        firstName,
      }),
    ).rejects.toThrow("Traveler ID must be a valid UUID.");
  });

  it("returns travelers ordered by first name", async () => {
    const firstTraveler = await createTraveler({
      firstName: `AAA ${firstName}`,
    });

    const secondTraveler = await createTraveler({
      firstName: `ZZZ ${firstName}`,
    });

    try {
      const allTravelers = await getTravelers();

      const firstIndex = allTravelers.findIndex(
        (item) => item.id === firstTraveler.id,
      );

      const secondIndex = allTravelers.findIndex(
        (item) => item.id === secondTraveler.id,
      );

      expect(firstIndex).toBeGreaterThanOrEqual(0);
      expect(secondIndex).toBeGreaterThanOrEqual(0);
      expect(firstIndex).toBeLessThan(secondIndex);
    } finally {
      await db.delete(travelers).where(eq(travelers.id, firstTraveler.id));

      await db.delete(travelers).where(eq(travelers.id, secondTraveler.id));
    }
  });

  it("rejects an invalid traveler ID", async () => {
    await expect(getTravelerById("invalid-id")).rejects.toThrow(
      "Traveler ID must be a valid UUID.",
    );
  });
});
