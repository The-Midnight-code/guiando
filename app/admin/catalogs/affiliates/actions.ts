"use server";

import { requireAdmin } from "@/lib/auth/permissions";
import { getDatabaseErrorMessage } from "@/lib/errors/database";

import {
  createAffiliate,
  updateAffiliate,
  toggleAffiliateActive,
  type CreateAffiliateInput,
} from "@/lib/queries/affiliates";

function getAffiliateErrorMessage(error: unknown): string | null {
  if (!(error instanceof Error)) return null;

  const knownErrors = new Set([
    "Affiliate ID must be a valid UUID.",
    "Affiliate name is required.",
  ]);

  return knownErrors.has(error.message) ? error.message : null;
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
      error:
        getAffiliateErrorMessage(error) ??
        getDatabaseErrorMessage(error) ??
        "Failed to create affiliate.",
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
      error:
        getAffiliateErrorMessage(error) ??
        getDatabaseErrorMessage(error) ??
        "Failed to update affiliate.",
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
      error:
        getAffiliateErrorMessage(error) ??
        getDatabaseErrorMessage(error) ??
        "Failed to update affiliate status.",
    };
  }
}
