import { afterEach, beforeEach, describe, expect, it } from "vitest";
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
  getActiveGuides,
  getAdminGuides,
  getGuideDashboardStats,
  getGuideScheduledTours,
  getGuideUpcomingTours,
} from "./guides";

describe("guides queries", () => {
  let userId: string;
  let guideId: string;

  let scheduledTourId: string | undefined;
  let tourId: string | undefined;
  let tourTypeId: string | undefined;
  let pickupLocationId: string | undefined;
  let inactiveUserId: string | undefined;

  beforeEach(async () => {
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const clerkId = `integration-guide-${suffix}`;
    const email = `integration-guide-${suffix}@example.com`;

    const [user] = await db
      .insert(users)
      .values({
        clerkId,
        email,
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
  });

  afterEach(async () => {
    if (scheduledTourId) {
      await db
        .delete(scheduledTourGuides)
        .where(eq(scheduledTourGuides.scheduledTourId, scheduledTourId));

      await db
        .delete(scheduledTours)
        .where(eq(scheduledTours.id, scheduledTourId));

      scheduledTourId = undefined;
    }

    if (pickupLocationId) {
      await db
        .delete(pickupLocations)
        .where(eq(pickupLocations.id, pickupLocationId));

      pickupLocationId = undefined;
    }

    if (tourId) {
      await db.delete(tours).where(eq(tours.id, tourId));

      tourId = undefined;
    }

    if (tourTypeId) {
      await db.delete(tourTypes).where(eq(tourTypes.id, tourTypeId));

      tourTypeId = undefined;
    }

    if (inactiveUserId) {
      await db.delete(users).where(eq(users.id, inactiveUserId));
      inactiveUserId = undefined;
    }

    if (userId) {
      await db.delete(users).where(eq(users.id, userId));

      userId = "";
      guideId = "";
    }
  });

  it("returns active guides with their user", async () => {
    const result = await getActiveGuides();

    const guide = result.find((item) => item.id === guideId);

    expect(guide).toBeDefined();
    expect(guide?.active).toBe(true);
    expect(guide?.user).not.toBeNull();
    expect(guide?.user?.email).toMatch(/^integration-guide-/);
    expect(guide?.user?.clerkId).toMatch(/^integration-guide-/);
  });

  it("does not return inactive guides", async () => {
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const [inactiveUser] = await db
      .insert(users)
      .values({
        clerkId: `integration-inactive-guide-${suffix}`,
        email: `integration-inactive-guide-${suffix}@example.com`,
        role: "GUIDE",
      })
      .returning();

    inactiveUserId = inactiveUser.id;

    const [inactiveGuide] = await db
      .insert(guides)
      .values({
        userId: inactiveUser.id,
        active: false,
      })
      .returning();

    const result = await getActiveGuides();

    expect(result.some((guide) => guide.id === inactiveGuide.id)).toBe(false);
  });

  it("returns admin guides with their user", async () => {
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const adminClerkId = `integration-admin-${suffix}`;
    const adminEmail = `integration-admin-${suffix}@example.com`;

    const [adminUser] = await db
      .insert(users)
      .values({
        clerkId: adminClerkId,
        email: adminEmail,
        role: "ADMIN",
      })
      .returning();

    try {
      const [adminGuide] = await db
        .insert(guides)
        .values({
          userId: adminUser.id,
          active: true,
        })
        .returning();

      const result = await getAdminGuides();

      const guide = result.find((item) => item.id === adminGuide.id);

      expect(guide).toBeDefined();
      expect(guide?.user).not.toBeNull();
      expect(guide?.user?.email).toBe(adminEmail);
      expect(guide?.user?.clerkId).toBe(adminClerkId);
    } finally {
      await db.delete(users).where(eq(users.id, adminUser.id));
    }
  });

  it("rejects invalid user ID in upcoming tours", async () => {
    await expect(getGuideUpcomingTours("invalid-user-id")).rejects.toThrow(
      "User ID must be a valid UUID.",
    );
  });

  it("rejects invalid user ID in scheduled tours", async () => {
    await expect(getGuideScheduledTours("invalid-user-id")).rejects.toThrow(
      "User ID must be a valid UUID.",
    );
  });

  it("rejects invalid user ID in dashboard stats", async () => {
    await expect(getGuideDashboardStats("invalid-user-id")).rejects.toThrow(
      "User ID must be a valid UUID.",
    );
  });

  it("rejects invalid limit in upcoming tours", async () => {
    await expect(getGuideUpcomingTours(userId, 0)).rejects.toThrow(
      "Limit must be a positive integer.",
    );
  });

  it("caps upcoming tours limit at 50", async () => {
    const result = await getGuideUpcomingTours(userId, 1000);

    expect(result.length).toBeLessThanOrEqual(50);
  });

  it("rejects invalid page in scheduled tours", async () => {
    await expect(
      getGuideScheduledTours(userId, undefined, undefined, 0),
    ).rejects.toThrow("Page must be a positive integer.");
  });

  it("rejects invalid page size in scheduled tours", async () => {
    await expect(
      getGuideScheduledTours(userId, undefined, undefined, 1, 0),
    ).rejects.toThrow("Limit must be a positive integer.");
  });

  it("returns empty upcoming tours without assignments", async () => {
    const result = await getGuideUpcomingTours(userId);

    expect(result).toEqual([]);
  });

  it("returns empty scheduled tours without assignments", async () => {
    const result = await getGuideScheduledTours(userId);

    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(0);
  });

  it("returns zero dashboard stats without assignments", async () => {
    const result = await getGuideDashboardStats(userId);

    expect(result).toEqual({
      upcoming: 0,
      today: 0,
      confirmed: 0,
    });
  });

  it("returns assigned guide tours and dashboard stats", async () => {
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const [tourType] = await db
      .insert(tourTypes)
      .values({
        name: `Integration Guide Type ${suffix}`,
        active: true,
      })
      .returning();

    tourTypeId = tourType.id;

    const [tour] = await db
      .insert(tours)
      .values({
        productId: `integration-guide-product-${suffix}`,
        name: `Integration Guide Tour ${suffix}`,
        tourTypeId: tourType.id,
      })
      .returning();

    tourId = tour.id;

    const [pickupLocation] = await db
      .insert(pickupLocations)
      .values({
        name: `Integration Guide Pickup ${suffix}`,
        address: "123 Integration Street",
        active: true,
      })
      .returning();

    pickupLocationId = pickupLocation.id;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tourDate = tomorrow.toISOString().split("T")[0];

    const [scheduledTour] = await db
      .insert(scheduledTours)
      .values({
        tourId: tour.id,
        externalId: Number(`9${Date.now().toString().slice(-5)}`),
        status: "CONFIRMED",
        tourDate,
        pickupLocationId: pickupLocation.id,
        numberOfPeople: 2,
      })
      .returning();

    scheduledTourId = scheduledTour.id;

    await db.insert(scheduledTourGuides).values({
      scheduledTourId: scheduledTour.id,
      guideId,
    });

    const upcomingTours = await getGuideUpcomingTours(userId);

    expect(upcomingTours).toHaveLength(1);
    expect(upcomingTours[0]?.id).toBe(scheduledTour.id);
    expect(upcomingTours[0]?.tourName).toBe(tour.name);
    expect(upcomingTours[0]?.pickupLocation).toBe(pickupLocation.name);

    const scheduledToursResult = await getGuideScheduledTours(userId);

    expect(scheduledToursResult.total).toBe(1);
    expect(scheduledToursResult.totalPages).toBe(1);
    expect(scheduledToursResult.items).toHaveLength(1);
    expect(scheduledToursResult.items[0]?.id).toBe(scheduledTour.id);
    expect(scheduledToursResult.items[0]?.tourName).toBe(tour.name);
    expect(scheduledToursResult.items[0]?.pickupLocation).toBe(
      pickupLocation.name,
    );

    const stats = await getGuideDashboardStats(userId);

    expect(stats.upcoming).toBe(1);
    expect(stats.confirmed).toBe(1);
    expect(stats.today).toBe(0);
  });
});
