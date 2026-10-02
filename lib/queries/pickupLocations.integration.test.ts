import { beforeEach, describe, expect, it } from "vitest";

import { eq } from "drizzle-orm";

import { db } from "@/db/db";
import { pickupLocations } from "@/db/schema";

import {
  createPickupLocation,
  getActivePickupLocations,
  getPickupLocationById,
  getPickupLocations,
  togglePickupLocationActive,
  updatePickupLocation,
} from "./pickupLocations";

describe("pickupLocations queries", () => {
  const pickupLocationName = `Integration Pickup ${Date.now()}`;

  beforeEach(async () => {
    await db
      .delete(pickupLocations)
      .where(eq(pickupLocations.name, pickupLocationName));
  });

  it("creates a pickup location", async () => {
    const pickupLocation = await createPickupLocation({
      name: pickupLocationName,
      address: "123 Integration Street",
      instructions: "Wait at the main entrance.",
      latitude: "32.5149",
      longitude: "-117.0382",
      active: true,
    });

    try {
      expect(pickupLocation.id).toBeDefined();
      expect(pickupLocation.name).toBe(pickupLocationName);
      expect(pickupLocation.address).toBe("123 Integration Street");
      expect(pickupLocation.instructions).toBe("Wait at the main entrance.");
      expect(pickupLocation.latitude).toBe("32.5149");
      expect(pickupLocation.longitude).toBe("-117.0382");
      expect(pickupLocation.active).toBe(true);
    } finally {
      await db
        .delete(pickupLocations)
        .where(eq(pickupLocations.id, pickupLocation.id));
    }
  });

  it("rejects an empty name", async () => {
    await expect(
      createPickupLocation({
        name: "   ",
        address: "123 Integration Street",
      }),
    ).rejects.toThrow("Pickup location name is required.");
  });

  it("rejects an empty address", async () => {
    await expect(
      createPickupLocation({
        name: pickupLocationName,
        address: "   ",
      }),
    ).rejects.toThrow("Pickup location address is required.");
  });

  it("creates optional fields as undefined when omitted", async () => {
    const pickupLocation = await createPickupLocation({
      name: pickupLocationName,
      address: "123 Integration Street",
    });

    try {
      expect(pickupLocation.instructions).toBeNull();
      expect(pickupLocation.latitude).toBeNull();
      expect(pickupLocation.longitude).toBeNull();
      expect(pickupLocation.active).toBe(true);
    } finally {
      await db
        .delete(pickupLocations)
        .where(eq(pickupLocations.id, pickupLocation.id));
    }
  });

  it("gets a pickup location by ID", async () => {
    const pickupLocation = await createPickupLocation({
      name: pickupLocationName,
      address: "123 Integration Street",
    });

    try {
      const result = await getPickupLocationById(pickupLocation.id);

      expect(result).toBeDefined();
      expect(result?.id).toBe(pickupLocation.id);
      expect(result?.name).toBe(pickupLocationName);
    } finally {
      await db
        .delete(pickupLocations)
        .where(eq(pickupLocations.id, pickupLocation.id));
    }
  });

  it("returns undefined for a nonexistent pickup location", async () => {
    const result = await getPickupLocationById(
      "11111111-1111-4111-8111-111111111111",
    );

    expect(result).toBeUndefined();
  });

  it("rejects an invalid pickup location ID", async () => {
    await expect(getPickupLocationById("invalid-id")).rejects.toThrow(
      "Pickup location ID must be a valid UUID.",
    );
  });

  it("updates a pickup location", async () => {
    const pickupLocation = await createPickupLocation({
      name: pickupLocationName,
      address: "123 Integration Street",
    });

    try {
      const updated = await updatePickupLocation(pickupLocation.id, {
        name: `${pickupLocationName} Updated`,
        address: "456 Updated Street",
        instructions: "Updated instructions.",
        latitude: "32.5200",
        longitude: "-117.0400",
        active: false,
      });

      expect(updated).toBeDefined();
      expect(updated?.id).toBe(pickupLocation.id);
      expect(updated?.name).toBe(`${pickupLocationName} Updated`);
      expect(updated?.address).toBe("456 Updated Street");
      expect(updated?.instructions).toBe("Updated instructions.");
      expect(updated?.latitude).toBe("32.5200");
      expect(updated?.longitude).toBe("-117.0400");
      expect(updated?.active).toBe(false);
    } finally {
      await db
        .delete(pickupLocations)
        .where(eq(pickupLocations.id, pickupLocation.id));
    }
  });

  it("rejects updating with an empty name", async () => {
    const pickupLocation = await createPickupLocation({
      name: pickupLocationName,
      address: "123 Integration Street",
    });

    try {
      await expect(
        updatePickupLocation(pickupLocation.id, {
          name: "   ",
          address: "456 Updated Street",
        }),
      ).rejects.toThrow("Pickup location name is required.");
    } finally {
      await db
        .delete(pickupLocations)
        .where(eq(pickupLocations.id, pickupLocation.id));
    }
  });

  it("rejects updating with an empty address", async () => {
    const pickupLocation = await createPickupLocation({
      name: pickupLocationName,
      address: "123 Integration Street",
    });

    try {
      await expect(
        updatePickupLocation(pickupLocation.id, {
          name: `${pickupLocationName} Updated`,
          address: "   ",
        }),
      ).rejects.toThrow("Pickup location address is required.");
    } finally {
      await db
        .delete(pickupLocations)
        .where(eq(pickupLocations.id, pickupLocation.id));
    }
  });

  it("rejects updating with an invalid ID", async () => {
    await expect(
      updatePickupLocation("invalid-id", {
        name: pickupLocationName,
        address: "123 Integration Street",
      }),
    ).rejects.toThrow("Pickup location ID must be a valid UUID.");
  });

  it("toggles a pickup location inactive", async () => {
    const pickupLocation = await createPickupLocation({
      name: pickupLocationName,
      address: "123 Integration Street",
      active: true,
    });

    try {
      const updated = await togglePickupLocationActive(
        pickupLocation.id,
        false,
      );

      expect(updated).toBeDefined();
      expect(updated?.active).toBe(false);
    } finally {
      await db
        .delete(pickupLocations)
        .where(eq(pickupLocations.id, pickupLocation.id));
    }
  });

  it("toggles a pickup location active", async () => {
    const pickupLocation = await createPickupLocation({
      name: pickupLocationName,
      address: "123 Integration Street",
      active: false,
    });

    try {
      const updated = await togglePickupLocationActive(pickupLocation.id, true);

      expect(updated).toBeDefined();
      expect(updated?.active).toBe(true);
    } finally {
      await db
        .delete(pickupLocations)
        .where(eq(pickupLocations.id, pickupLocation.id));
    }
  });

  it("returns only active pickup locations", async () => {
    const activeLocation = await createPickupLocation({
      name: `AAA ${pickupLocationName}`,
      address: "123 Active Street",
      active: true,
    });

    const inactiveLocation = await createPickupLocation({
      name: `ZZZ ${pickupLocationName}`,
      address: "456 Inactive Street",
      active: false,
    });

    try {
      const activeLocations = await getActivePickupLocations();

      expect(
        activeLocations.some((item) => item.id === activeLocation.id),
      ).toBe(true);

      expect(
        activeLocations.some((item) => item.id === inactiveLocation.id),
      ).toBe(false);
    } finally {
      await db
        .delete(pickupLocations)
        .where(eq(pickupLocations.id, activeLocation.id));

      await db
        .delete(pickupLocations)
        .where(eq(pickupLocations.id, inactiveLocation.id));
    }
  });

  it("returns pickup locations ordered by name", async () => {
    const firstLocation = await createPickupLocation({
      name: `AAA ${pickupLocationName}`,
      address: "123 First Street",
      active: true,
    });

    const secondLocation = await createPickupLocation({
      name: `ZZZ ${pickupLocationName}`,
      address: "456 Second Street",
      active: false,
    });

    try {
      const allLocations = await getPickupLocations();

      const firstIndex = allLocations.findIndex(
        (item) => item.id === firstLocation.id,
      );

      const secondIndex = allLocations.findIndex(
        (item) => item.id === secondLocation.id,
      );

      expect(firstIndex).toBeGreaterThanOrEqual(0);
      expect(secondIndex).toBeGreaterThanOrEqual(0);
      expect(firstIndex).toBeLessThan(secondIndex);

      expect(allLocations[firstIndex].name).toBe(firstLocation.name);
      expect(allLocations[secondIndex].name).toBe(secondLocation.name);
    } finally {
      await db
        .delete(pickupLocations)
        .where(eq(pickupLocations.id, firstLocation.id));

      await db
        .delete(pickupLocations)
        .where(eq(pickupLocations.id, secondLocation.id));
    }
  });
});
