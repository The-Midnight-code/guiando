import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { eq } from "drizzle-orm";

import { db } from "@/db/db";

import {
  pickupLocations,
  scheduledTourTravelers,
  scheduledTours,
  tourTypes,
  tours,
  travelers,
} from "@/db/schema";

import {
  assignTravelerToScheduledTour,
  getTravelersForScheduledTour,
  removeTravelerFromScheduledTour,
  syncNumberOfPeople,
} from "./scheduledTourTravelers";

describe("scheduledTourTravelers integration", () => {
  let tourTypeId: string;
  let pickupLocationId: string;
  let tourId: string;
  let scheduledTourId: string;
  let travelerIds: string[] = [];
  let externalId: number;

  beforeAll(async () => {
    externalId = 910000 + Math.floor(Math.random() * 9999);

    const [tourType] = await db
      .insert(tourTypes)
      .values({
        name: `Integration Traveler Type ${externalId}`,
        description: "Integration test",
      })
      .returning();

    tourTypeId = tourType.id;

    const [pickupLocation] = await db
      .insert(pickupLocations)
      .values({
        name: `Integration Traveler Pickup ${externalId}`,
        address: "Integration Test Address",
      })
      .returning();

    pickupLocationId = pickupLocation.id;

    const [tour] = await db
      .insert(tours)
      .values({
        productId: `integration-traveler-${externalId}`,
        name: `Integration Traveler Tour ${externalId}`,
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
        {
          firstName: `Integration Traveler 3 ${externalId}`,
          lastName: "Test",
        },
      ])
      .returning();

    travelerIds = createdTravelers.map((traveler) => traveler.id);
  });

  afterAll(async () => {
    await db
      .delete(scheduledTourTravelers)
      .where(eq(scheduledTourTravelers.scheduledTourId, scheduledTourId));

    await db
      .delete(scheduledTours)
      .where(eq(scheduledTours.id, scheduledTourId));

    for (const travelerId of travelerIds) {
      await db.delete(travelers).where(eq(travelers.id, travelerId));
    }

    await db.delete(tours).where(eq(tours.id, tourId));

    await db
      .delete(pickupLocations)
      .where(eq(pickupLocations.id, pickupLocationId));

    await db.delete(tourTypes).where(eq(tourTypes.id, tourTypeId));
  });

  it("keeps numberOfPeople synchronized with traveler assignments", async () => {
    const [traveler1, traveler2, traveler3] = travelerIds;

    await assignTravelerToScheduledTour(externalId, traveler1);
    await assignTravelerToScheduledTour(externalId, traveler2);
    await assignTravelerToScheduledTour(externalId, traveler3);

    const [scheduledTourAfterAssignments] = await db
      .select({
        numberOfPeople: scheduledTours.numberOfPeople,
      })
      .from(scheduledTours)
      .where(eq(scheduledTours.id, scheduledTourId));

    expect(scheduledTourAfterAssignments.numberOfPeople).toBe(3);

    const assignedTravelers = await getTravelersForScheduledTour(externalId);

    expect(assignedTravelers).toHaveLength(3);

    await removeTravelerFromScheduledTour(externalId, traveler2);

    const [scheduledTourAfterRemoval] = await db
      .select({
        numberOfPeople: scheduledTours.numberOfPeople,
      })
      .from(scheduledTours)
      .where(eq(scheduledTours.id, scheduledTourId));

    expect(scheduledTourAfterRemoval.numberOfPeople).toBe(2);

    const remainingTravelers = await getTravelersForScheduledTour(externalId);

    expect(remainingTravelers).toHaveLength(2);
  });

  it("does not create duplicate traveler assignments", async () => {
    const [traveler1] = travelerIds;

    const firstAssignment = await assignTravelerToScheduledTour(
      externalId,
      traveler1,
    );

    const secondAssignment = await assignTravelerToScheduledTour(
      externalId,
      traveler1,
    );

    expect(secondAssignment.id).toBe(firstAssignment.id);

    const assignedTravelers = await getTravelersForScheduledTour(externalId);

    expect(assignedTravelers).toHaveLength(2);

    const [scheduledTourAfterDuplicate] = await db
      .select({
        numberOfPeople: scheduledTours.numberOfPeople,
      })
      .from(scheduledTours)
      .where(eq(scheduledTours.id, scheduledTourId));

    expect(scheduledTourAfterDuplicate.numberOfPeople).toBe(2);
  });

  it("can resynchronize numberOfPeople from existing assignments", async () => {
    const [scheduledTourBeforeSync] = await db
      .select({
        numberOfPeople: scheduledTours.numberOfPeople,
      })
      .from(scheduledTours)
      .where(eq(scheduledTours.id, scheduledTourId));

    expect(scheduledTourBeforeSync.numberOfPeople).toBe(2);

    await db
      .update(scheduledTours)
      .set({
        numberOfPeople: 999,
      })
      .where(eq(scheduledTours.id, scheduledTourId));

    const syncedTour = await syncNumberOfPeople(externalId);

    expect(syncedTour.numberOfPeople).toBe(2);
  });
});
