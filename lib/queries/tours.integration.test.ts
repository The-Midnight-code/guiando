import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { eq } from "drizzle-orm";

import { db } from "@/db/db";

import {
  pickupLocations,
  scheduledTours,
  tourClasses,
  tourTypes,
  tours,
} from "@/db/schema";

import {
  createTour,
  deleteTour,
  getActiveTours,
  getTourById,
  getTours,
  updateTour,
} from "./tours";

describe("tours integration", () => {
  let tourTypeId: string;
  let tourClassId: string;
  let tourId: string;
  let productId: string;

  beforeAll(async () => {
    productId = `integration-tour-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const [tourType] = await db
      .insert(tourTypes)
      .values({
        name: `Integration Tour Type ${productId}`,
        description: "Integration test",
      })
      .returning();

    tourTypeId = tourType.id;

    const [tourClass] = await db
      .insert(tourClasses)
      .values({
        name: `Integration Tour Class ${productId}`,
        description: "Integration test",
      })
      .returning();

    tourClassId = tourClass.id;

    const tour = await createTour({
      productId,
      name: `Integration Tour ${productId}`,
      description: "Integration test",
      duration: 120,
      price: "150.00",
      tourTypeId,
      tourClassId,
    });

    tourId = tour.id;
  });

  afterAll(async () => {
    if (tourId) {
      await db.delete(tours).where(eq(tours.id, tourId));
    }

    if (tourClassId) {
      await db.delete(tourClasses).where(eq(tourClasses.id, tourClassId));
    }

    if (tourTypeId) {
      await db.delete(tourTypes).where(eq(tourTypes.id, tourTypeId));
    }
  });

  it("creates a tour with valid references", async () => {
    const tour = await createTour({
      productId: `integration-created-${productId}`,
      name: `Created Tour ${productId}`,
      duration: 90,
      price: "100.00",
      tourTypeId,
      tourClassId,
    });

    try {
      expect(tour).toBeDefined();
      expect(tour.name).toBe(`Created Tour ${productId}`);
      expect(tour.tourTypeId).toBe(tourTypeId);
      expect(tour.tourClassId).toBe(tourClassId);
      expect(tour.price).toBe("100.00");
    } finally {
      await db.delete(tours).where(eq(tours.id, tour.id));
    }
  });

  it("rejects a nonexistent tour type", async () => {
    await expect(
      createTour({
        productId: `integration-invalid-type-${productId}`,
        name: "Invalid Tour Type",
        tourTypeId: "00000000-0000-4000-8000-000000000001",
      }),
    ).rejects.toThrow("Tour type not found.");
  });

  it("rejects a nonexistent tour class", async () => {
    await expect(
      createTour({
        productId: `integration-invalid-class-${productId}`,
        name: "Invalid Tour Class",
        tourTypeId,
        tourClassId: "00000000-0000-4000-8000-000000000002",
      }),
    ).rejects.toThrow("Tour class not found.");
  });

  it("rejects updating with a nonexistent tour type", async () => {
    await expect(
      updateTour(tourId, {
        productId,
        name: `Integration Tour ${productId}`,
        duration: 120,
        price: "150.00",
        tourTypeId: "00000000-0000-4000-8000-000000000003",
        tourClassId,
      }),
    ).rejects.toThrow("Tour type not found.");
  });

  it("rejects an invalid duration", async () => {
    await expect(
      createTour({
        productId: `integration-invalid-duration-${productId}`,
        name: "Invalid Duration Tour",
        duration: 0,
        price: "100.00",
        tourTypeId,
        tourClassId,
      }),
    ).rejects.toThrow("Duration must be a positive integer.");
  });

  it("rejects a non-integer duration", async () => {
    await expect(
      createTour({
        productId: `integration-decimal-duration-${productId}`,
        name: "Decimal Duration Tour",
        duration: 90.5,
        price: "100.00",
        tourTypeId,
        tourClassId,
      }),
    ).rejects.toThrow("Duration must be a positive integer.");
  });

  it("rejects a negative price", async () => {
    await expect(
      createTour({
        productId: `integration-negative-price-${productId}`,
        name: "Negative Price Tour",
        duration: 90,
        price: "-1.00",
        tourTypeId,
        tourClassId,
      }),
    ).rejects.toThrow("Price must be a valid non-negative number.");
  });

  it("rejects deleting a tour with scheduled tours", async () => {
    const [pickupLocation] = await db
      .insert(pickupLocations)
      .values({
        name: `Integration Delete Pickup ${productId}`,
        address: "Integration Test Address",
      })
      .returning();

    const [scheduledTour] = await db
      .insert(scheduledTours)
      .values({
        tourId,
        status: "CONFIRMED",
        tourDate: "2026-10-20",
        pickupLocationId: pickupLocation.id,
      })
      .returning();

    try {
      await expect(deleteTour(tourId)).rejects.toMatchObject({
        cause: {
          code: "23503",
        },
      });
    } finally {
      await db
        .delete(scheduledTours)
        .where(eq(scheduledTours.id, scheduledTour.id));

      await db
        .delete(pickupLocations)
        .where(eq(pickupLocations.id, pickupLocation.id));
    }
  });

  it("rejects a price with more than two decimal places", async () => {
    await expect(
      createTour({
        productId: `integration-decimal-price-${productId}`,
        name: "Invalid Decimal Price Tour",
        duration: 90,
        price: "100.123",
        tourTypeId,
        tourClassId,
      }),
    ).rejects.toThrow("Price cannot have more than 2 decimal places.");
  });

  it("rejects updating with a nonexistent tour class", async () => {
    await expect(
      updateTour(tourId, {
        productId,
        name: `Integration Tour ${productId}`,
        duration: 120,
        price: "150.00",
        tourTypeId,
        tourClassId: "00000000-0000-4000-8000-000000000004",
      }),
    ).rejects.toThrow("Tour class not found.");
  });

  it("gets an existing tour by ID", async () => {
    const tour = await getTourById(tourId);

    expect(tour).toBeDefined();
    expect(tour?.id).toBe(tourId);
    expect(tour?.name).toBe(`Integration Tour ${productId}`);
    expect(tour?.tourTypeId).toBe(tourTypeId);
    expect(tour?.tourClassId).toBe(tourClassId);
  });

  it("returns undefined for a nonexistent tour", async () => {
    const tour = await getTourById("00000000-0000-4000-8000-000000000099");

    expect(tour).toBeUndefined();
  });

  it("rejects an invalid tour ID", async () => {
    await expect(getTourById("invalid-id")).rejects.toThrow(
      "Tour ID must be a valid UUID.",
    );
  });

  it("returns only active tours", async () => {
    const inactiveTour = await createTour({
      productId: `integration-inactive-${productId}`,
      name: `Inactive Tour ${productId}`,
      duration: 60,
      price: "75.00",
      tourTypeId,
      tourClassId,
      active: false,
    });

    try {
      const activeTours = await getActiveTours();

      expect(activeTours.some((tour) => tour.id === inactiveTour.id)).toBe(
        false,
      );

      expect(activeTours.some((tour) => tour.id === tourId)).toBe(true);
    } finally {
      await db.delete(tours).where(eq(tours.id, inactiveTour.id));
    }
  });

  it("filters active tours by tour type", async () => {
    const [otherTourType] = await db
      .insert(tourTypes)
      .values({
        name: `Integration Other Tour Type ${productId}`,
        description: "Integration test",
      })
      .returning();

    const otherTour = await createTour({
      productId: `integration-other-type-${productId}`,
      name: `Other Type Tour ${productId}`,
      duration: 90,
      price: "125.00",
      tourTypeId: otherTourType.id,
      tourClassId,
      active: true,
    });

    try {
      const activeTours = await getActiveTours(tourTypeId);

      expect(activeTours.some((tour) => tour.id === tourId)).toBe(true);

      expect(activeTours.some((tour) => tour.id === otherTour.id)).toBe(false);
    } finally {
      await db.delete(tours).where(eq(tours.id, otherTour.id));

      await db.delete(tourTypes).where(eq(tourTypes.id, otherTourType.id));
    }
  });

  it("returns tours with their type and class", async () => {
    const toursResult = await getTours();

    const tour = toursResult.find((item) => item.id === tourId);

    expect(tour).toBeDefined();
    expect(tour?.tourType?.id).toBe(tourTypeId);
    expect(tour?.tourClass?.id).toBe(tourClassId);
  });

  it("rejects a duplicate product ID", async () => {
    const duplicateProductId = `integration-duplicate-${productId}`;

    const firstTour = await createTour({
      productId: duplicateProductId,
      name: `First Duplicate Tour ${productId}`,
      duration: 60,
      price: "50.00",
      tourTypeId,
      tourClassId,
    });

    try {
      await expect(
        createTour({
          productId: duplicateProductId,
          name: `Second Duplicate Tour ${productId}`,
          duration: 60,
          price: "75.00",
          tourTypeId,
          tourClassId,
        }),
      ).rejects.toMatchObject({
        cause: {
          code: "23505",
        },
      });
    } finally {
      await db.delete(tours).where(eq(tours.id, firstTour.id));
    }
  });

  it("deletes a tour without scheduled tours", async () => {
    const tour = await createTour({
      productId: `integration-delete-${productId}`,
      name: `Delete Tour ${productId}`,
      duration: 60,
      price: "50.00",
      tourTypeId,
      tourClassId,
    });

    const deletedTour = await deleteTour(tour.id);

    expect(deletedTour).toBeDefined();
    expect(deletedTour?.id).toBe(tour.id);

    const remainingTour = await db.query.tours.findFirst({
      where: {
        id: tour.id,
      },
    });

    expect(remainingTour).toBeUndefined();
  });
});
