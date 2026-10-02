import { beforeEach, describe, expect, it } from "vitest";

import { eq } from "drizzle-orm";

import { db } from "@/db/db";
import { affiliates } from "@/db/schema";

import {
  createAffiliate,
  getActiveAffiliates,
  getAffiliateById,
  getAffiliates,
  toggleAffiliateActive,
  updateAffiliate,
} from "./affiliates";

describe("affiliates queries", () => {
  const affiliateName = `Integration Affiliate ${Date.now()}`;

  beforeEach(async () => {
    await db.delete(affiliates).where(eq(affiliates.name, affiliateName));
  });

  it("creates an affiliate", async () => {
    const affiliate = await createAffiliate({
      name: affiliateName,
      description: "Integration test affiliate",
      active: true,
    });

    try {
      expect(affiliate.id).toBeDefined();
      expect(affiliate.name).toBe(affiliateName);
      expect(affiliate.description).toBe("Integration test affiliate");
      expect(affiliate.active).toBe(true);
    } finally {
      await db.delete(affiliates).where(eq(affiliates.id, affiliate.id));
    }
  });

  it("rejects an empty name", async () => {
    await expect(
      createAffiliate({
        name: "   ",
      }),
    ).rejects.toThrow("Affiliate name is required.");
  });

  it("creates optional fields as undefined when omitted", async () => {
    const affiliate = await createAffiliate({
      name: affiliateName,
    });

    try {
      expect(affiliate.description).toBeNull();
      expect(affiliate.active).toBe(true);
    } finally {
      await db.delete(affiliates).where(eq(affiliates.id, affiliate.id));
    }
  });

  it("gets an affiliate by ID", async () => {
    const affiliate = await createAffiliate({
      name: affiliateName,
    });

    try {
      const result = await getAffiliateById(affiliate.id);

      expect(result).toBeDefined();
      expect(result?.id).toBe(affiliate.id);
      expect(result?.name).toBe(affiliateName);
    } finally {
      await db.delete(affiliates).where(eq(affiliates.id, affiliate.id));
    }
  });

  it("returns undefined for a nonexistent affiliate", async () => {
    const result = await getAffiliateById(
      "11111111-1111-4111-8111-111111111111",
    );

    expect(result).toBeUndefined();
  });

  it("rejects an invalid affiliate ID", async () => {
    await expect(getAffiliateById("invalid-id")).rejects.toThrow(
      "Affiliate ID must be a valid UUID.",
    );
  });

  it("updates an affiliate", async () => {
    const affiliate = await createAffiliate({
      name: affiliateName,
    });

    try {
      const updated = await updateAffiliate(affiliate.id, {
        name: `${affiliateName} Updated`,
        description: "Updated description",
        active: false,
      });

      expect(updated).toBeDefined();
      expect(updated?.id).toBe(affiliate.id);
      expect(updated?.name).toBe(`${affiliateName} Updated`);
      expect(updated?.description).toBe("Updated description");
      expect(updated?.active).toBe(false);
    } finally {
      await db.delete(affiliates).where(eq(affiliates.id, affiliate.id));
    }
  });

  it("rejects updating with an empty name", async () => {
    const affiliate = await createAffiliate({
      name: affiliateName,
    });

    try {
      await expect(
        updateAffiliate(affiliate.id, {
          name: "   ",
        }),
      ).rejects.toThrow("Affiliate name is required.");
    } finally {
      await db.delete(affiliates).where(eq(affiliates.id, affiliate.id));
    }
  });

  it("rejects updating with an invalid ID", async () => {
    await expect(
      updateAffiliate("invalid-id", {
        name: affiliateName,
      }),
    ).rejects.toThrow("Affiliate ID must be a valid UUID.");
  });

  it("toggles an affiliate inactive", async () => {
    const affiliate = await createAffiliate({
      name: affiliateName,
      active: true,
    });

    try {
      const updated = await toggleAffiliateActive(affiliate.id, false);

      expect(updated).toBeDefined();
      expect(updated?.active).toBe(false);
    } finally {
      await db.delete(affiliates).where(eq(affiliates.id, affiliate.id));
    }
  });

  it("toggles an affiliate active", async () => {
    const affiliate = await createAffiliate({
      name: affiliateName,
      active: false,
    });

    try {
      const updated = await toggleAffiliateActive(affiliate.id, true);

      expect(updated).toBeDefined();
      expect(updated?.active).toBe(true);
    } finally {
      await db.delete(affiliates).where(eq(affiliates.id, affiliate.id));
    }
  });

  it("returns only active affiliates", async () => {
    const activeAffiliate = await createAffiliate({
      name: `AAA ${affiliateName}`,
      active: true,
    });

    const inactiveAffiliate = await createAffiliate({
      name: `ZZZ ${affiliateName}`,
      active: false,
    });

    try {
      const activeAffiliates = await getActiveAffiliates();

      expect(
        activeAffiliates.some((item) => item.id === activeAffiliate.id),
      ).toBe(true);

      expect(
        activeAffiliates.some((item) => item.id === inactiveAffiliate.id),
      ).toBe(false);
    } finally {
      await db.delete(affiliates).where(eq(affiliates.id, activeAffiliate.id));

      await db
        .delete(affiliates)
        .where(eq(affiliates.id, inactiveAffiliate.id));
    }
  });

  it("returns affiliates ordered by name", async () => {
    const firstAffiliate = await createAffiliate({
      name: `AAA ${affiliateName}`,
      active: true,
    });

    const secondAffiliate = await createAffiliate({
      name: `ZZZ ${affiliateName}`,
      active: false,
    });

    try {
      const allAffiliates = await getAffiliates();

      const firstIndex = allAffiliates.findIndex(
        (item) => item.id === firstAffiliate.id,
      );

      const secondIndex = allAffiliates.findIndex(
        (item) => item.id === secondAffiliate.id,
      );

      expect(firstIndex).toBeGreaterThanOrEqual(0);
      expect(secondIndex).toBeGreaterThanOrEqual(0);
      expect(firstIndex).toBeLessThan(secondIndex);

      expect(allAffiliates[firstIndex].name).toBe(firstAffiliate.name);
      expect(allAffiliates[secondIndex].name).toBe(secondAffiliate.name);
    } finally {
      await db.delete(affiliates).where(eq(affiliates.id, firstAffiliate.id));

      await db.delete(affiliates).where(eq(affiliates.id, secondAffiliate.id));
    }
  });
});
