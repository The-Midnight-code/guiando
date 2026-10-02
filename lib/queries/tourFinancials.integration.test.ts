import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { eq } from "drizzle-orm";

import { db } from "@/db/db";

import {
  pickupLocations,
  scheduledTourTravelers,
  scheduledTours,
  tourFinancials,
  tourTypes,
  tours,
  travelers,
} from "@/db/schema";

import {
  createTourFinancials,
  getFinancialsForScheduledTour,
} from "./tourFinancials";

describe("tourFinancials integration", () => {
  let tourTypeId: string;
  let pickupLocationId: string;
  let tourId: string;
  let scheduledTourId: string;
  let externalId: number;
  let travelerIds: string[] = [];

  beforeAll(async () => {
    externalId = 900000 + Math.floor(Math.random() * 9999);

    const [tourType] = await db
      .insert(tourTypes)
      .values({
        name: `Integration Test Type ${externalId}`,
        description: "Integration test",
      })
      .returning();

    tourTypeId = tourType.id;

    const [pickupLocation] = await db
      .insert(pickupLocations)
      .values({
        name: `Integration Test Pickup ${externalId}`,
        address: "Integration Test Address",
      })
      .returning();

    pickupLocationId = pickupLocation.id;

    const [tour] = await db
      .insert(tours)
      .values({
        productId: `integration-${externalId}`,
        name: `Integration Test Tour ${externalId}`,
        description: "Integration test",
        duration: 120,
        price: "100.00",
        tourTypeId,
      })
      .returning();

    tourId = tour.id;

    const [scheduledTour] = await db
      .insert(scheduledTours)
      .values({
        tourId,
        externalId,
        status: "CONFIRMED",
        tourDate: "2026-10-05",
        pickupLocationId,
        numberOfPeople: 999,
      })
      .returning();

    scheduledTourId = scheduledTour.id;

    const createdTravelers = await db
      .insert(travelers)
      .values([
        {
          firstName: `Integration Traveler 1 ${externalId}`,
          lastName: "Test",
        },
        {
          firstName: `Integration Traveler 2 ${externalId}`,
          lastName: "Test",
        },
      ])
      .returning();

    travelerIds = createdTravelers.map((traveler) => traveler.id);

    await db.insert(scheduledTourTravelers).values(
      travelerIds.map((travelerId) => ({
        scheduledTourId,
        travelerId,
      })),
    );
  });

  afterAll(async () => {
    await db
      .delete(tourFinancials)
      .where(eq(tourFinancials.scheduledTourId, scheduledTourId));

    await db
      .delete(scheduledTourTravelers)
      .where(eq(scheduledTourTravelers.scheduledTourId, scheduledTourId));

    if (travelerIds.length > 0) {
      for (const travelerId of travelerIds) {
        await db.delete(travelers).where(eq(travelers.id, travelerId));
      }
    }

    await db
      .delete(scheduledTours)
      .where(eq(scheduledTours.id, scheduledTourId));

    await db.delete(tours).where(eq(tours.id, tourId));

    await db
      .delete(pickupLocations)
      .where(eq(pickupLocations.id, pickupLocationId));

    await db.delete(tourTypes).where(eq(tourTypes.id, tourTypeId));
  });

  it("creates financials using the actual assigned traveler count", async () => {
    const financials = await createTourFinancials(externalId, {
      totalPaymentUsd: "500",
      guideCostMxn: "1000",
      transportationCostMxn: "500",
      travelersCostMxn: "250",
      extraExpensesMxn: "250",
      exchangeRate: "20",
    });

    expect(financials.scheduledTourId).toBe(scheduledTourId);
    expect(financials.totalTravelersCostMxn).toBe("500.00");
    expect(financials.totalCostMxn).toBe("2250.00");
    expect(financials.totalCostUsd).toBe("112.50");
    expect(financials.totalRevenueUsd).toBe("387.50");
    expect(financials.revenuePercentage).toBe("77.50");

    const storedFinancials = await getFinancialsForScheduledTour(externalId);

    expect(storedFinancials?.totalTravelersCostMxn).toBe("500.00");
    expect(storedFinancials?.totalCostMxn).toBe("2250.00");
    expect(storedFinancials?.totalCostUsd).toBe("112.50");
  });
});
