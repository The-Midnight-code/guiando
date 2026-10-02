import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { eq } from "drizzle-orm";

import { db } from "@/db/db";

import { tourTypes } from "@/db/schema";

import {
  createTourType,
  getActiveTourTypes,
  getTourTypeById,
  getTourTypes,
  toggleTourTypeActive,
  updateTourType,
} from "./tourTypes";

describe("tourTypes integration", () => {
  let tourTypeId: string;
  let tourTypeName: string;

  beforeAll(async () => {
    tourTypeName = `Integration Tour Type ${Date.now()}-${Math.floor(
      Math.random() * 10000,
    )}`;

    const [tourType] = await db
      .insert(tourTypes)
      .values({
        name: tourTypeName,
        description: "Integration test",
        active: true,
      })
      .returning();

    tourTypeId = tourType.id;
  });

  afterAll(async () => {
    if (tourTypeId) {
      await db.delete(tourTypes).where(eq(tourTypes.id, tourTypeId));
    }
  });

  it("updates a tour type with valid data", async () => {
    const updated = await updateTourType(tourTypeId, {
      name: `${tourTypeName} Updated`,
      description: "Updated by integration test",
      active: false,
    });

    expect(updated).toBeDefined();
    expect(updated?.id).toBe(tourTypeId);
    expect(updated?.name).toBe(`${tourTypeName} Updated`);
    expect(updated?.description).toBe("Updated by integration test");
    expect(updated?.active).toBe(false);

    await updateTourType(tourTypeId, {
      name: tourTypeName,
      description: "Integration test",
      active: true,
    });
  });

  it("toggles a tour type to inactive", async () => {
    const updated = await toggleTourTypeActive(tourTypeId, false);

    expect(updated).toBeDefined();
    expect(updated?.id).toBe(tourTypeId);
    expect(updated?.active).toBe(false);

    await toggleTourTypeActive(tourTypeId, true);
  });

  it("toggles a tour type to active", async () => {
    const updated = await toggleTourTypeActive(tourTypeId, true);

    expect(updated).toBeDefined();
    expect(updated?.id).toBe(tourTypeId);
    expect(updated?.active).toBe(true);
  });

  it("rejects updating a tour type with an empty name", async () => {
    await expect(
      updateTourType(tourTypeId, {
        name: "   ",
      }),
    ).rejects.toThrow("Tour type name is required.");
  });

  it("rejects updating a tour type with an invalid ID", async () => {
    await expect(
      updateTourType("invalid-id", {
        name: "Valid Name",
      }),
    ).rejects.toThrow("Tour type ID must be a valid UUID.");
  });

  it("returns tour types ordered by name", async () => {
    const firstType = await createTourType({
      name: `AAA ${tourTypeName}`,
      active: true,
    });

    const secondType = await createTourType({
      name: `ZZZ ${tourTypeName}`,
      active: false,
    });

    try {
      const allTypes = await getTourTypes();

      const firstIndex = allTypes.findIndex((item) => item.id === firstType.id);

      const secondIndex = allTypes.findIndex(
        (item) => item.id === secondType.id,
      );

      expect(firstIndex).toBeGreaterThanOrEqual(0);
      expect(secondIndex).toBeGreaterThanOrEqual(0);
      expect(firstIndex).toBeLessThan(secondIndex);

      expect(allTypes[firstIndex].name).toBe(firstType.name);
      expect(allTypes[secondIndex].name).toBe(secondType.name);
    } finally {
      await db.delete(tourTypes).where(eq(tourTypes.id, firstType.id));

      await db.delete(tourTypes).where(eq(tourTypes.id, secondType.id));
    }
  });

  it("returns only active tour types ordered by name", async () => {
    const activeType = await createTourType({
      name: `AAA Active ${tourTypeName}`,
      active: true,
    });

    const inactiveType = await createTourType({
      name: `ZZZ Inactive ${tourTypeName}`,
      active: false,
    });

    try {
      const activeTypes = await getActiveTourTypes();

      const activeIndex = activeTypes.findIndex(
        (item) => item.id === activeType.id,
      );

      const inactiveIndex = activeTypes.findIndex(
        (item) => item.id === inactiveType.id,
      );

      expect(activeIndex).toBeGreaterThanOrEqual(0);
      expect(inactiveIndex).toBe(-1);

      expect(activeTypes[activeIndex]).toEqual({
        id: activeType.id,
        name: activeType.name,
      });

      if (activeIndex > 0) {
        expect(
          activeTypes[activeIndex - 1].name.localeCompare(
            activeTypes[activeIndex].name,
          ),
        ).toBeLessThanOrEqual(0);
      }
    } finally {
      await db.delete(tourTypes).where(eq(tourTypes.id, activeType.id));

      await db.delete(tourTypes).where(eq(tourTypes.id, inactiveType.id));
    }
  });

  it("rejects an empty tour type name", async () => {
    await expect(
      createTourType({
        name: "   ",
      }),
    ).rejects.toThrow("Tour type name is required.");
  });

  it("gets an existing tour type by ID", async () => {
    const tourType = await getTourTypeById(tourTypeId);

    expect(tourType).toBeDefined();
    expect(tourType?.id).toBe(tourTypeId);
    expect(tourType?.name).toBe(tourTypeName);
  });

  it("returns undefined for a nonexistent tour type", async () => {
    const tourType = await getTourTypeById(
      "00000000-0000-4000-8000-000000000099",
    );

    expect(tourType).toBeUndefined();
  });

  it("rejects an invalid tour type ID", async () => {
    await expect(getTourTypeById("invalid-id")).rejects.toThrow(
      "Tour type ID must be a valid UUID.",
    );
  });
});
