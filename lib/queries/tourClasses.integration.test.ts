import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { eq } from "drizzle-orm";

import { db } from "@/db/db";

import { tourClasses } from "@/db/schema";

import {
  createTourClass,
  getActiveTourClasses,
  getTourClasses,
  getTourClassById,
  toggleTourClassActive,
  updateTourClass,
} from "./tourClasses";

describe("tourClasses integration", () => {
  let tourClassId: string;
  let tourClassName: string;

  beforeAll(async () => {
    tourClassName = `Integration Tour Class ${Date.now()}-${Math.floor(
      Math.random() * 10000,
    )}`;

    const [tourClass] = await db
      .insert(tourClasses)
      .values({
        name: tourClassName,
        description: "Integration test",
        active: true,
      })
      .returning();

    tourClassId = tourClass.id;
  });

  afterAll(async () => {
    if (tourClassId) {
      await db.delete(tourClasses).where(eq(tourClasses.id, tourClassId));
    }
  });

  it("creates a tour class with valid data", async () => {
    const created = await createTourClass({
      name: `Created Tour Class ${tourClassName}`,
      description: "Created by integration test",
      active: true,
    });

    try {
      expect(created).toBeDefined();
      expect(created.name).toBe(`Created Tour Class ${tourClassName}`);
      expect(created.description).toBe("Created by integration test");
      expect(created.active).toBe(true);
    } finally {
      await db.delete(tourClasses).where(eq(tourClasses.id, created.id));
    }
  });

  it("rejects an empty tour class name", async () => {
    await expect(
      createTourClass({
        name: "   ",
      }),
    ).rejects.toThrow("Tour class name is required.");
  });

  it("gets an existing tour class by ID", async () => {
    const tourClass = await getTourClassById(tourClassId);

    expect(tourClass).toBeDefined();
    expect(tourClass?.id).toBe(tourClassId);
    expect(tourClass?.name).toBe(tourClassName);
  });

  it("returns undefined for a nonexistent tour class", async () => {
    const tourClass = await getTourClassById(
      "00000000-0000-4000-8000-000000000099",
    );

    expect(tourClass).toBeUndefined();
  });

  it("updates a tour class with valid data", async () => {
    const updated = await updateTourClass(tourClassId, {
      name: `${tourClassName} Updated`,
      description: "Updated by integration test",
      active: false,
    });

    expect(updated).toBeDefined();
    expect(updated?.id).toBe(tourClassId);
    expect(updated?.name).toBe(`${tourClassName} Updated`);
    expect(updated?.description).toBe("Updated by integration test");
    expect(updated?.active).toBe(false);

    await updateTourClass(tourClassId, {
      name: tourClassName,
      description: "Integration test",
      active: true,
    });
  });

  it("rejects updating a tour class with an empty name", async () => {
    await expect(
      updateTourClass(tourClassId, {
        name: "   ",
      }),
    ).rejects.toThrow("Tour class name is required.");
  });

  it("rejects updating a tour class with an invalid ID", async () => {
    await expect(
      updateTourClass("invalid-id", {
        name: "Valid Name",
      }),
    ).rejects.toThrow("Tour class ID must be a valid UUID.");
  });

  it("toggles a tour class to inactive", async () => {
    const updated = await toggleTourClassActive(tourClassId, false);

    expect(updated).toBeDefined();
    expect(updated?.id).toBe(tourClassId);
    expect(updated?.active).toBe(false);

    await toggleTourClassActive(tourClassId, true);
  });

  it("toggles a tour class to active", async () => {
    const updated = await toggleTourClassActive(tourClassId, true);

    expect(updated).toBeDefined();
    expect(updated?.id).toBe(tourClassId);
    expect(updated?.active).toBe(true);
  });

  it("returns tour classes ordered by name", async () => {
    const firstClass = await createTourClass({
      name: `AAA ${tourClassName}`,
      active: true,
    });

    const secondClass = await createTourClass({
      name: `ZZZ ${tourClassName}`,
      active: false,
    });

    try {
      const allClasses = await getTourClasses();

      const firstIndex = allClasses.findIndex(
        (item) => item.id === firstClass.id,
      );

      const secondIndex = allClasses.findIndex(
        (item) => item.id === secondClass.id,
      );

      expect(firstIndex).toBeGreaterThanOrEqual(0);
      expect(secondIndex).toBeGreaterThanOrEqual(0);
      expect(firstIndex).toBeLessThan(secondIndex);

      expect(allClasses[firstIndex].name).toBe(firstClass.name);
      expect(allClasses[secondIndex].name).toBe(secondClass.name);
    } finally {
      await db.delete(tourClasses).where(eq(tourClasses.id, firstClass.id));

      await db.delete(tourClasses).where(eq(tourClasses.id, secondClass.id));
    }
  });

  it("returns only active tour classes ordered by name", async () => {
    const activeClass = await createTourClass({
      name: `AAA Active ${tourClassName}`,
      active: true,
    });

    const inactiveClass = await createTourClass({
      name: `ZZZ Inactive ${tourClassName}`,
      active: false,
    });

    try {
      const activeClasses = await getActiveTourClasses();

      const activeIndex = activeClasses.findIndex(
        (item) => item.id === activeClass.id,
      );

      const inactiveIndex = activeClasses.findIndex(
        (item) => item.id === inactiveClass.id,
      );

      expect(activeIndex).toBeGreaterThanOrEqual(0);
      expect(inactiveIndex).toBe(-1);

      expect(activeClasses[activeIndex].id).toBe(activeClass.id);
      expect(activeClasses[activeIndex].name).toBe(activeClass.name);

      if (activeIndex > 0) {
        expect(
          activeClasses[activeIndex - 1].name.localeCompare(
            activeClasses[activeIndex].name,
          ),
        ).toBeLessThanOrEqual(0);
      }
    } finally {
      await db.delete(tourClasses).where(eq(tourClasses.id, activeClass.id));

      await db.delete(tourClasses).where(eq(tourClasses.id, inactiveClass.id));
    }
  });

  it("rejects an invalid tour class ID", async () => {
    await expect(getTourClassById("invalid-id")).rejects.toThrow(
      "Tour class ID must be a valid UUID.",
    );
  });
});
