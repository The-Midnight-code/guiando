import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { eq } from "drizzle-orm";

import { db } from "@/db/db";
import { tourPhotos, tourTypes, tours } from "@/db/schema";

import {
  createTourPhoto,
  deleteTourPhoto,
  getTourPhotoById,
  getTourPhotos,
  updateTourPhoto,
} from "./tourPhotos";

describe("tourPhotos integration", () => {
  let tourId: string;
  let tourProductId: string;
  let tourTypeId: string;

  beforeAll(async () => {
    const tourTypeName = `Integration Tour Photo Type ${Date.now()}-${Math.floor(
      Math.random() * 10000,
    )}`;

    const [tourType] = await db
      .insert(tourTypes)
      .values({
        name: tourTypeName,
        active: true,
      })
      .returning();

    tourTypeId = tourType.id;

    tourProductId = `integration-tour-photos-${Date.now()}-${Math.floor(
      Math.random() * 10000,
    )}`;

    const [tour] = await db
      .insert(tours)
      .values({
        productId: tourProductId,
        name: `Integration Tour Photos ${Date.now()}`,
        description: "Integration test",
        duration: 120,
        price: "100.00",
        tourTypeId,
        active: true,
      })
      .returning();

    tourId = tour.id;
  });

  afterAll(async () => {
    if (tourId) {
      await db.delete(tourPhotos).where(eq(tourPhotos.tourId, tourId));
      await db.delete(tours).where(eq(tours.id, tourId));
    }
  });

  it("creates a tour photo with valid data", async () => {
    const created = await createTourPhoto({
      tourId,
      url: "https://example.com/photo.jpg",
      alt: "Tour photo",
      sortOrder: 1,
    });

    try {
      expect(created).toBeDefined();
      expect(created.tourId).toBe(tourId);
      expect(created.url).toBe("https://example.com/photo.jpg");
      expect(created.alt).toBe("Tour photo");
      expect(created.sortOrder).toBe(1);
    } finally {
      await db.delete(tourPhotos).where(eq(tourPhotos.id, created.id));
    }
  });

  it("trims photo URL and alt text", async () => {
    const created = await createTourPhoto({
      tourId,
      url: "  https://example.com/photo.jpg  ",
      alt: "  Tour photo  ",
      sortOrder: 2,
    });

    try {
      expect(created.url).toBe("https://example.com/photo.jpg");
      expect(created.alt).toBe("Tour photo");
    } finally {
      await db.delete(tourPhotos).where(eq(tourPhotos.id, created.id));
    }
  });

  it("rejects an empty photo URL", async () => {
    await expect(
      createTourPhoto({
        tourId,
        url: "   ",
      }),
    ).rejects.toThrow("Photo URL is required.");
  });

  it("rejects an invalid photo URL", async () => {
    await expect(
      createTourPhoto({
        tourId,
        url: "not-a-url",
      }),
    ).rejects.toThrow("Photo URL must be a valid URL.");
  });

  it("rejects a non-HTTP photo URL", async () => {
    await expect(
      createTourPhoto({
        tourId,
        url: "javascript:alert(1)",
      }),
    ).rejects.toThrow("Photo URL must use HTTP or HTTPS.");
  });

  it("rejects a data URL", async () => {
    await expect(
      createTourPhoto({
        tourId,
        url: "data:image/png;base64,abc",
      }),
    ).rejects.toThrow("Photo URL must use HTTP or HTTPS.");
  });

  it("rejects a photo URL longer than 2048 characters", async () => {
    await expect(
      createTourPhoto({
        tourId,
        url: `https://example.com/${"a".repeat(2048)}`,
      }),
    ).rejects.toThrow("Photo URL must not exceed 2048 characters.");
  });

  it("rejects a negative sort order", async () => {
    await expect(
      createTourPhoto({
        tourId,
        url: "https://example.com/photo.jpg",
        sortOrder: -1,
      }),
    ).rejects.toThrow("Sort order must be a non-negative integer.");
  });

  it("rejects a non-integer sort order", async () => {
    await expect(
      createTourPhoto({
        tourId,
        url: "https://example.com/photo.jpg",
        sortOrder: 1.5,
      }),
    ).rejects.toThrow("Sort order must be a non-negative integer.");
  });

  it("rejects a nonexistent tour", async () => {
    await expect(
      createTourPhoto({
        tourId: "00000000-0000-4000-8000-000000000099",
        url: "https://example.com/photo.jpg",
      }),
    ).rejects.toThrow("Tour not found.");
  });

  it("gets a tour photo by ID", async () => {
    const created = await createTourPhoto({
      tourId,
      url: "https://example.com/get-photo.jpg",
      sortOrder: 3,
    });

    try {
      const photo = await getTourPhotoById(created.id);

      expect(photo).toBeDefined();
      expect(photo?.id).toBe(created.id);
      expect(photo?.url).toBe("https://example.com/get-photo.jpg");
    } finally {
      await db.delete(tourPhotos).where(eq(tourPhotos.id, created.id));
    }
  });

  it("returns undefined for a nonexistent photo", async () => {
    const photo = await getTourPhotoById(
      "00000000-0000-4000-8000-000000000099",
    );

    expect(photo).toBeUndefined();
  });

  it("returns photos ordered by sort order", async () => {
    const first = await createTourPhoto({
      tourId,
      url: "https://example.com/order-first.jpg",
      sortOrder: 1,
    });

    const second = await createTourPhoto({
      tourId,
      url: "https://example.com/order-second.jpg",
      sortOrder: 2,
    });

    try {
      const photos = await getTourPhotos(tourId);

      const firstIndex = photos.findIndex((photo) => photo.id === first.id);
      const secondIndex = photos.findIndex((photo) => photo.id === second.id);

      expect(firstIndex).toBeGreaterThanOrEqual(0);
      expect(secondIndex).toBeGreaterThanOrEqual(0);
      expect(firstIndex).toBeLessThan(secondIndex);
    } finally {
      await db.delete(tourPhotos).where(eq(tourPhotos.id, first.id));
      await db.delete(tourPhotos).where(eq(tourPhotos.id, second.id));
    }
  });

  it("updates a tour photo", async () => {
    const created = await createTourPhoto({
      tourId,
      url: "https://example.com/before.jpg",
      alt: "Before",
      sortOrder: 1,
    });

    try {
      const updated = await updateTourPhoto(created.id, {
        url: "https://example.com/after.jpg",
        alt: "After",
        sortOrder: 5,
      });

      expect(updated).toBeDefined();
      expect(updated?.id).toBe(created.id);
      expect(updated?.url).toBe("https://example.com/after.jpg");
      expect(updated?.alt).toBe("After");
      expect(updated?.sortOrder).toBe(5);
    } finally {
      await db.delete(tourPhotos).where(eq(tourPhotos.id, created.id));
    }
  });

  it("rejects updating a photo with an invalid ID", async () => {
    await expect(
      updateTourPhoto("invalid-id", {
        url: "https://example.com/photo.jpg",
      }),
    ).rejects.toThrow("Photo ID must be a valid UUID.");
  });

  it("rejects updating a photo with an invalid URL", async () => {
    const created = await createTourPhoto({
      tourId,
      url: "https://example.com/photo.jpg",
    });

    try {
      await expect(
        updateTourPhoto(created.id, {
          url: "javascript:alert(1)",
        }),
      ).rejects.toThrow("Photo URL must use HTTP or HTTPS.");
    } finally {
      await db.delete(tourPhotos).where(eq(tourPhotos.id, created.id));
    }
  });

  it("deletes a tour photo", async () => {
    const created = await createTourPhoto({
      tourId,
      url: "https://example.com/delete.jpg",
    });

    const deleted = await deleteTourPhoto(created.id);

    expect(deleted).toBeDefined();
    expect(deleted?.id).toBe(created.id);

    const photo = await getTourPhotoById(created.id);

    expect(photo).toBeUndefined();
  });

  it("rejects deleting a photo with an invalid ID", async () => {
    await expect(deleteTourPhoto("invalid-id")).rejects.toThrow(
      "Photo ID must be a valid UUID.",
    );
  });
});
