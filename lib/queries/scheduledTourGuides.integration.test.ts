import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { randomUUID } from "crypto";

import { eq } from "drizzle-orm";

import { db } from "@/db/db";

import {
  guides,
  pickupLocations,
  scheduledTourGuides,
  scheduledTours,
  tourTypes,
  tours,
  users,
} from "@/db/schema";

import {
  assignGuideToScheduledTour,
  getGuidesForScheduledTour,
  removeGuideFromScheduledTour,
} from "./scheduledTourGuides";

describe("scheduledTourGuides integration", () => {
  let tourTypeId: string;
  let pickupLocationId: string;
  let tourId: string;
  let scheduledTourId: string;
  let guideId: string;
  let userId: string;
  let externalId: number;

  beforeAll(async () => {
    externalId = 930000 + Math.floor(Math.random() * 9999);

    const [user] = await db
      .insert(users)
      .values({
        clerkId: `integration-guide-${externalId}`,
        email: `integration-guide-${externalId}@example.com`,
        firstName: "Integration",
        lastName: `Guide ${externalId}`,
        role: "GUIDE",
      })
      .returning();

    userId = user.id;

    const [guide] = await db
      .insert(guides)
      .values({
        userId,
        active: true,
      })
      .returning();

    guideId = guide.id;

    const [tourType] = await db
      .insert(tourTypes)
      .values({
        name: `Integration Guide Assignment Type ${externalId}`,
        description: "Integration test",
      })
      .returning();

    tourTypeId = tourType.id;

    const [pickupLocation] = await db
      .insert(pickupLocations)
      .values({
        name: `Integration Guide Assignment Pickup ${externalId}`,
        address: "Integration Test Address",
      })
      .returning();

    pickupLocationId = pickupLocation.id;

    const [tour] = await db
      .insert(tours)
      .values({
        productId: `integration-guide-assignment-${externalId}`,
        name: `Integration Guide Assignment Tour ${externalId}`,
        description: "Integration test",
        duration: 120,
        price: "150.00",
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
        tourDate: "2026-10-20",
        pickupLocationId,
      })
      .returning();

    scheduledTourId = scheduledTour.id;
  });

  afterAll(async () => {
    await db
      .delete(scheduledTourGuides)
      .where(eq(scheduledTourGuides.scheduledTourId, scheduledTourId));

    await db
      .delete(scheduledTours)
      .where(eq(scheduledTours.id, scheduledTourId));

    await db.delete(guides).where(eq(guides.id, guideId));

    await db.delete(users).where(eq(users.id, userId));

    await db.delete(tours).where(eq(tours.id, tourId));

    await db
      .delete(pickupLocations)
      .where(eq(pickupLocations.id, pickupLocationId));

    await db.delete(tourTypes).where(eq(tourTypes.id, tourTypeId));
  });

  it("assigns an active guide to a scheduled tour", async () => {
    const assignment = await assignGuideToScheduledTour(externalId, guideId);

    expect(assignment).toBeDefined();
    expect(assignment.scheduledTourId).toBe(scheduledTourId);
    expect(assignment.guideId).toBe(guideId);
  });

  it("rejects assigning an inactive guide", async () => {
    const inactiveUserId = randomUUID();
    const inactiveGuideId = randomUUID();

    await db.insert(users).values({
      id: inactiveUserId,
      clerkId: `integration-inactive-guide-${externalId}`,
      email: `integration-inactive-guide-${externalId}@example.com`,
      role: "GUIDE",
    });

    await db.insert(guides).values({
      id: inactiveGuideId,
      userId: inactiveUserId,
      active: false,
    });

    try {
      await expect(
        assignGuideToScheduledTour(externalId, inactiveGuideId),
      ).rejects.toThrow("Guide is inactive.");
    } finally {
      await db.delete(guides).where(eq(guides.id, inactiveGuideId));

      await db.delete(users).where(eq(users.id, inactiveUserId));
    }
  });

  it("rejects assigning a nonexistent guide", async () => {
    const nonexistentGuideId = randomUUID();

    await expect(
      assignGuideToScheduledTour(externalId, nonexistentGuideId),
    ).rejects.toThrow("Guide not found.");
  });

  it("returns the assigned guides for a scheduled tour", async () => {
    const assignments = await getGuidesForScheduledTour(externalId);

    expect(assignments).toHaveLength(1);

    const assignment = assignments[0];

    expect(assignment).toBeDefined();
    expect(assignment!.guideId).toBe(guideId);
    expect(assignment!.guide).toBeDefined();
    expect(assignment!.guide!.userId).toBe(userId);
  });

  it("does not create a duplicate guide assignment", async () => {
    const existingAssignments = await db
      .select()
      .from(scheduledTourGuides)
      .where(eq(scheduledTourGuides.scheduledTourId, scheduledTourId));

    expect(existingAssignments).toHaveLength(1);

    const existingAssignment = existingAssignments[0];

    expect(existingAssignment).toBeDefined();

    const assignment = await assignGuideToScheduledTour(externalId, guideId);

    expect(assignment.id).toBe(existingAssignment!.id);

    const assignments = await db
      .select()
      .from(scheduledTourGuides)
      .where(eq(scheduledTourGuides.scheduledTourId, scheduledTourId));

    expect(assignments).toHaveLength(1);
  });

  it("removes a guide assignment", async () => {
    const deletedAssignment = await removeGuideFromScheduledTour(
      externalId,
      guideId,
    );

    expect(deletedAssignment).toBeDefined();
    expect(deletedAssignment?.scheduledTourId).toBe(scheduledTourId);
    expect(deletedAssignment?.guideId).toBe(guideId);

    const assignments = await getGuidesForScheduledTour(externalId);

    expect(assignments).toHaveLength(0);
  });
});
