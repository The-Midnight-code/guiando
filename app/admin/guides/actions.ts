"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { requireAdmin } from "@/lib/auth/permissions";
import { db } from "@/db/db";
import { guides, users } from "@/db/schema";

function isValidUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export async function updateGuideAction(
  guideId: string,
  phone: string,
  active: boolean,
  role: "ADMIN" | "GUIDE",
) {
  const currentUser = await requireAdmin();

  if (!isValidUuid(guideId)) {
    throw new Error("Guide ID must be a valid UUID.");
  }

  const normalizedPhone = phone.trim();

  if (normalizedPhone.length > 30) {
    throw new Error("Phone number is too long.");
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
        phone: normalizedPhone || null,
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

  try {
    const client = await clerkClient();

    await client.users.updateUserMetadata(guide.user.clerkId, {
      publicMetadata: {
        role,
      },
    });
  } catch (error) {
    console.error("Failed to synchronize Clerk role metadata:", error);
  }
}
