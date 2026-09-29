"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { db } from "@/db/db";
import { guides, users } from "@/db/schema";

export async function updateGuideAction(
  guideId: string,
  phone: string,
  active: boolean,
  role: "ADMIN" | "GUIDE",
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const currentUser = await db.query.users.findFirst({
    where: {
      clerkId: userId,
    },
  });

  if (!currentUser || currentUser.role !== "ADMIN") {
    throw new Error("Forbidden");
  }

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

  if (currentUser.id === guide.userId) {
    throw new Error("You cannot change your own role.");
  }

  if (!guide.user?.clerkId) {
    throw new Error("Guide has no Clerk ID.");
  }

  await db
    .update(guides)
    .set({
      phone: phone.trim() || null,
      active,
      updatedAt: new Date(),
    })
    .where(eq(guides.id, guideId));

  await db
    .update(users)
    .set({
      role,
      updatedAt: new Date(),
    })
    .where(eq(users.id, guide.userId));

  if (role === "GUIDE") {
    await db
      .insert(guides)
      .values({
        userId: guide.userId,
        active: true,
      })
      .onConflictDoNothing({
        target: guides.userId,
      });
  }

  const client = await clerkClient();

  await client.users.updateUserMetadata(guide.user.clerkId, {
    publicMetadata: {
      role,
    },
  });
}
