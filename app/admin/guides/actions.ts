"use server";

import { clerkClient } from "@clerk/nextjs/server";

import { eq } from "drizzle-orm";

import { requireAdmin } from "@/lib/auth/permissions";

import { db } from "@/db/db";

import { guides, users } from "@/db/schema";

export async function updateGuideAction(
  guideId: string,
  phone: string,
  active: boolean,
  role: "ADMIN" | "GUIDE",
) {
  const currentUser = await requireAdmin();

  const guide = await db.query.guides.findFirst({
    where: {
      id: guideId,
    },
    with: {
      user: true,
    },
  });

  if (!guide) {
    throw new Error("Guide not found.");
  }

  if (currentUser.id === guide.userId && role !== currentUser.role) {
    throw new Error("You cannot change your own role.");
  }

  if (!guide.user?.clerkId) {
    throw new Error("Guide has no Clerk ID.");
  }

  await db.transaction(async (tx) => {
    await tx
      .update(guides)
      .set({
        phone: phone.trim() || null,
        active,
        updatedAt: new Date(),
      })
      .where(eq(guides.id, guideId));

    await tx
      .update(users)
      .set({
        role,
        updatedAt: new Date(),
      })
      .where(eq(users.id, guide.userId));

    if (role === "GUIDE") {
      await tx
        .insert(guides)
        .values({
          userId: guide.userId,
          active: true,
        })
        .onConflictDoNothing({
          target: guides.userId,
        });
    }
  });

  const client = await clerkClient();

  await client.users.updateUserMetadata(guide.user.clerkId, {
    publicMetadata: {
      role,
    },
  });
}
