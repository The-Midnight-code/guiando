import { beforeEach, describe, expect, it } from "vitest";

import { eq } from "drizzle-orm";

import { db } from "@/db/db";
import { users } from "@/db/schema";

import { getUserByClerkId, getUsers } from "./users";

describe("users queries", () => {
  const clerkId = `integration-clerk-${Date.now()}`;
  const email = `integration-user-${Date.now()}@example.com`;

  beforeEach(async () => {
    await db.delete(users).where(eq(users.clerkId, clerkId));
  });

  it("gets a user by Clerk ID", async () => {
    const [user] = await db
      .insert(users)
      .values({
        clerkId,
        email,
        role: "GUIDE",
      })
      .returning();

    try {
      const result = await getUserByClerkId(clerkId);

      expect(result).toBeDefined();
      expect(result?.id).toBe(user.id);
      expect(result?.clerkId).toBe(clerkId);
      expect(result?.email).toBe(email);
      expect(result?.role).toBe("GUIDE");
    } finally {
      await db.delete(users).where(eq(users.id, user.id));
    }
  });

  it("returns undefined for a nonexistent Clerk ID", async () => {
    const result = await getUserByClerkId(`nonexistent-clerk-${Date.now()}`);

    expect(result).toBeUndefined();
  });

  it("rejects an empty Clerk ID", async () => {
    await expect(getUserByClerkId("   ")).rejects.toThrow(
      "Clerk ID is required.",
    );
  });

  it("returns users", async () => {
    const firstEmail = `integration-first-${Date.now()}@example.com`;
    const secondEmail = `integration-second-${Date.now()}@example.com`;

    const [firstUser] = await db
      .insert(users)
      .values({
        clerkId: `${clerkId}-first`,
        email: firstEmail,
        role: "GUIDE",
      })
      .returning();

    const [secondUser] = await db
      .insert(users)
      .values({
        clerkId: `${clerkId}-second`,
        email: secondEmail,
        role: "ADMIN",
      })
      .returning();

    try {
      const result = await getUsers();

      expect(result.some((user) => user.id === firstUser.id)).toBe(true);

      expect(result.some((user) => user.id === secondUser.id)).toBe(true);
    } finally {
      await db.delete(users).where(eq(users.id, firstUser.id));

      await db.delete(users).where(eq(users.id, secondUser.id));
    }
  });
});
