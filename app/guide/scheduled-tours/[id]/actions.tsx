"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { getUserByClerkId } from "@/lib/queries/users";
import { completeScheduledTour } from "@/lib/queries/scheduledTours";

export async function completeScheduledTourAction(id: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await getUserByClerkId(userId);

  if (!user || user.role !== "GUIDE") {
    throw new Error("Unauthorized");
  }

  const updatedTour = await completeScheduledTour(id, user.id);

  if (!updatedTour) {
    throw new Error("Tour not found or not assigned to guide");
  }

  revalidatePath(`/guide/scheduled-tours/${id}`);
  revalidatePath("/guide/scheduled-tours");
  revalidatePath("/guide/dashboard");

  return updatedTour;
}
