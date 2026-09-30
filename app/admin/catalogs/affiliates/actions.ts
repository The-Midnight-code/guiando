"use server";
import { auth } from "@clerk/nextjs/server";

import { db } from "@/db/db";
import {
  createAffiliate,
  updateAffiliate,
  toggleAffiliateActive,
  type CreateAffiliateInput,
} from "@/lib/queries/affiliates";

async function requireAdmin() {
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
}

export async function createAffiliateAction(input: CreateAffiliateInput) {
  await requireAdmin();
  try {
    const affiliate = await createAffiliate(input);

    return {
      success: true,
      data: affiliate,
    };
  } catch (error) {
    console.error("Error creating affiliate:", error);

    return {
      success: false,
      error: "Failed to create affiliate.",
    };
  }
}

export async function updateAffiliateAction(
  id: string,
  input: CreateAffiliateInput,
) {
  await requireAdmin();
  try {
    const affiliate = await updateAffiliate(id, input);

    if (!affiliate) {
      return {
        success: false,
        error: "Affiliate not found.",
      };
    }

    return {
      success: true,
      data: affiliate,
    };
  } catch (error) {
    console.error("Error updating affiliate:", error);

    return {
      success: false,
      error: "Failed to update affiliate.",
    };
  }
}

export async function toggleAffiliateActiveAction(id: string, active: boolean) {
  await requireAdmin();
  try {
    const affiliate = await toggleAffiliateActive(id, active);

    if (!affiliate) {
      return {
        success: false,
        error: "Affiliate not found.",
      };
    }

    return {
      success: true,
      data: affiliate,
    };
  } catch (error) {
    console.error("Error updating affiliate status:", error);

    return {
      success: false,
      error: "Failed to update affiliate status.",
    };
  }
}
