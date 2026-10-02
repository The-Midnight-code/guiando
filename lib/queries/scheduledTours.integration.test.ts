import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { eq } from "drizzle-orm";

import { db } from "@/db/db";

import {
  pickupLocations,
  scheduledTours,
  tourFinancials,
  tourTypes,
  tours,
} from "@/db/schema";

import {
  createScheduledTour,
  deleteScheduledTour,
  updateScheduledTour,
} from "./scheduledTours";

describe("scheduledTours integration", () => {
  let tourTypeId: string;
  let pickupLocationId: string;
  let tourId: string;
  let scheduledTourId: string;
  let externalId: number;

  beforeAll(async () => {
    externalId = 920000 + Math.floor(Math.random() * 9999);

    const [tourType] = await db
      .insert(tourTypes)
      .values({
        name: `Integration Scheduled Tour Type ${externalId}`,
        description: "Integration test",
      })
      .returning();

    tourTypeId = tourType.id;

    const [pickupLocation] = await db
      .insert(pickupLocations)
      .values({
        name: `Integration Scheduled Tour Pickup ${externalId}`,
        address: "Integration Test Address",
      })
      .returning();

    pickupLocationId = pickupLocation.id;

    const [tour] = await db
      .insert(tours)
      .values({
        productId: `integration-scheduled-tour-${externalId}`,
        name: `Integration Scheduled Tour ${externalId}`,
        description: "Integration test",
        duration: 120,
        price: "150.00",
        tourTypeId,
      })
      .returning();

    tourId = tour.id;
  });

  afterAll(async () => {
    if (scheduledTourId) {
      await db
        .delete(scheduledTours)
        .where(eq(scheduledTours.id, scheduledTourId));
    }

    await db.delete(tours).where(eq(tours.id, tourId));

    await db
      .delete(pickupLocations)
      .where(eq(pickupLocations.id, pickupLocationId));

    await db.delete(tourTypes).where(eq(tourTypes.id, tourTypeId));
  });

  it("creates a scheduled tour with valid references", async () => {
    const scheduledTour = await createScheduledTour({
      tourId,
      externalId,
      status: "PENDING",
      bookingDate: "2026-10-01",
      tourDate: "2026-10-10",
      pickupLocationId,
      startTime: "09:00",
      endTime: "13:00",
      locationStart: "Hotel",
      locationEnd: "Hotel",
      specialIndications: "Integration test",
      tip: "100.00",
    });

    scheduledTourId = scheduledTour.id;

    expect(scheduledTour.tourId).toBe(tourId);
    expect(scheduledTour.externalId).toBe(externalId);
    expect(scheduledTour.status).toBe("PENDING");
    expect(scheduledTour.tourDate).toBe("2026-10-10");
    expect(scheduledTour.startTime).toBe("09:00:00");
    expect(scheduledTour.endTime).toBe("13:00:00");
    expect(scheduledTour.tip).toBe("100.00");
  });

  it("updates the scheduled tour", async () => {
    const updatedTour = await updateScheduledTour(externalId, {
      tourId,
      externalId,
      status: "CONFIRMED",
      bookingDate: "2026-10-02",
      tourDate: "2026-10-11",
      pickupLocationId,
      startTime: "10:00",
      endTime: "14:00",
      locationStart: "Hotel A",
      locationEnd: "Hotel B",
      specialIndications: "Updated integration test",
      tip: "150.00",
    });

    expect(updatedTour).toBeDefined();
    expect(updatedTour?.id).toBe(scheduledTourId);
    expect(updatedTour?.status).toBe("CONFIRMED");
    expect(updatedTour?.tourDate).toBe("2026-10-11");
    expect(updatedTour?.startTime).toBe("10:00:00");
    expect(updatedTour?.endTime).toBe("14:00:00");
    expect(updatedTour?.locationStart).toBe("Hotel A");
    expect(updatedTour?.locationEnd).toBe("Hotel B");
    expect(updatedTour?.tip).toBe("150.00");
  });

  it("rejects an invalid time range", async () => {
    await expect(
      updateScheduledTour(externalId, {
        tourId,
        externalId,
        status: "CONFIRMED",
        tourDate: "2026-10-11",
        pickupLocationId,
        startTime: "14:00",
        endTime: "10:00",
      }),
    ).rejects.toThrow("End time cannot be earlier than start time.");
  });

  it("rejects a duplicate external ID", async () => {
    await expect(
      createScheduledTour({
        tourId,
        externalId,
        status: "PENDING",
        tourDate: "2026-10-12",
        pickupLocationId,
      }),
    ).rejects.toThrow("A scheduled tour with this external ID already exists.");
  });

  it("rejects deleting a scheduled tour with financial records", async () => {
    const financialExternalId = externalId + 1;

    const [financialScheduledTour] = await db
      .insert(scheduledTours)
      .values({
        tourId,
        externalId: financialExternalId,
        status: "CONFIRMED",
        tourDate: "2026-10-15",
        pickupLocationId,
      })
      .returning();

    await db.insert(tourFinancials).values({
      scheduledTourId: financialScheduledTour.id,
      totalPaymentUsd: "100.00",
      guideCostMxn: "500.00",
      transportationCostMxn: "200.00",
      travelersCostMxn: "0.00",
      totalTravelersCostMxn: "0.00",
      extraExpensesMxn: "100.00",
      totalCostMxn: "800.00",
      totalCostUsd: "40.00",
      totalRevenueUsd: "60.00",
      revenuePercentage: "60.00",
      exchangeRate: "20.0000",
    });

    await expect(deleteScheduledTour(financialExternalId)).rejects.toThrow(
      "Scheduled tours with financial records cannot be deleted.",
    );

    await db
      .delete(tourFinancials)
      .where(eq(tourFinancials.scheduledTourId, financialScheduledTour.id));

    await db
      .delete(scheduledTours)
      .where(eq(scheduledTours.id, financialScheduledTour.id));
  });

  it("deletes a scheduled tour without financial records", async () => {
    const deletedTour = await deleteScheduledTour(externalId);

    expect(deletedTour).toBeDefined();
    expect(deletedTour?.id).toBe(scheduledTourId);
  });
});
