"use server";
import { requireAdmin } from "@/lib/auth/permissions";
import {
  createTourFinancials,
  updateTourFinancials,
  type UpsertTourFinancialsInput,
} from "@/lib/queries/tourFinancials";

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
      error: "Failed to create tour financials.",
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
      error: "Failed to update tour financials.",
    };
  }
}
