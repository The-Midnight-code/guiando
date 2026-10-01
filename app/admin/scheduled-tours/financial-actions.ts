"use server";

import { requireAdmin } from "@/lib/auth/permissions";
import { getDatabaseErrorMessage } from "@/lib/errors/database";

import {
  createTourFinancials,
  updateTourFinancials,
  type UpsertTourFinancialsInput,
} from "@/lib/queries/tourFinancials";

function getTourFinancialsErrorMessage(error: unknown): string | null {
  if (!(error instanceof Error)) return null;

  const knownErrors = new Set([
    "Scheduled tour ID must be a positive integer.",
    "Scheduled tour not found.",
    "Total payment must be a valid number.",
    "Total payment cannot be negative.",
    "Guide cost must be a valid number.",
    "Guide cost cannot be negative.",
    "Transportation cost must be a valid number.",
    "Transportation cost cannot be negative.",
    "Traveler cost must be a valid number.",
    "Traveler cost cannot be negative.",
    "Extra expenses must be a valid number.",
    "Extra expenses cannot be negative.",
    "Exchange rate must be a valid number.",
    "Exchange rate must be greater than zero.",
  ]);

  return knownErrors.has(error.message) ? error.message : null;
}

export async function createTourFinancialsAction(
  externalId: number,
  input: UpsertTourFinancialsInput,
) {
  await requireAdmin();

  try {
    const financials = await createTourFinancials(externalId, input);

    return {
      success: true,
      data: financials,
    };
  } catch (error) {
    console.error("Error creating tour financials:", error);

    return {
      success: false,
      error:
        getTourFinancialsErrorMessage(error) ??
        getDatabaseErrorMessage(error) ??
        "Failed to create tour financials.",
    };
  }
}

export async function updateTourFinancialsAction(
  externalId: number,
  input: UpsertTourFinancialsInput,
) {
  await requireAdmin();

  try {
    const financials = await updateTourFinancials(externalId, input);

    if (!financials) {
      return {
        success: false,
        error: "Financials not found.",
      };
    }

    return {
      success: true,
      data: financials,
    };
  } catch (error) {
    console.error("Error updating tour financials:", error);

    return {
      success: false,
      error:
        getTourFinancialsErrorMessage(error) ??
        getDatabaseErrorMessage(error) ??
        "Failed to update tour financials.",
    };
  }
}
