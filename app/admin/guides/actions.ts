"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db/db";
import { guides } from "@/db/schema";

export async function updateGuideAction(
  guideId: string,
  phone: string,
  active: boolean,
) {
  await db
    .update(guides)
    .set({
      phone: phone.trim() || null,
      active,
      updatedAt: new Date(),
    })
    .where(eq(guides.id, guideId));
}
