"use server";

import { revalidatePath } from "next/cache";

import { requireGuide } from "@/lib/auth/permissions";
import { completeScheduledTour } from "@/lib/queries/scheduledTours";

export async function completeScheduledTourAction(id: string) {
  const user = await requireGuide();

  const updatedTour = await completeScheduledTour(id, user.id);

  if (!updatedTour) {
    throw new Error("Tour not found or not assigned to guide");
  }

  revalidatePath(`/guide/scheduled-tours/${id}`);
  revalidatePath("/guide/scheduled-tours");
  revalidatePath("/guide/dashboard");

  return updatedTour;
}
