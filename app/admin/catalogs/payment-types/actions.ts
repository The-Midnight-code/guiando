"use server";

import { requireAdmin } from "@/lib/auth/permissions";
import { getDatabaseErrorMessage } from "@/lib/errors/database";

import {
  createPaymentType,
  updatePaymentType,
  togglePaymentTypeActive,
  type CreatePaymentTypeInput,
} from "@/lib/queries/paymentTypes";

function getPaymentTypeErrorMessage(error: unknown): string | null {
  if (!(error instanceof Error)) return null;

  const knownErrors = new Set([
    "Payment type ID must be a valid UUID.",
    "Payment type name is required.",
  ]);

  return knownErrors.has(error.message) ? error.message : null;
}

export async function createPaymentTypeAction(input: CreatePaymentTypeInput) {
  await requireAdmin();

  try {
    const paymentType = await createPaymentType(input);

    return {
      success: true,
      data: paymentType,
    };
  } catch (error) {
    console.error("Error creating payment type:", error);

    return {
      success: false,
      error:
        getPaymentTypeErrorMessage(error) ??
        getDatabaseErrorMessage(error) ??
        "Failed to create payment type.",
    };
  }
}

export async function updatePaymentTypeAction(
  id: string,
  input: CreatePaymentTypeInput,
) {
  await requireAdmin();

  try {
    const paymentType = await updatePaymentType(id, input);

    if (!paymentType) {
      return {
        success: false,
        error: "Payment type not found.",
      };
    }

    return {
      success: true,
      data: paymentType,
    };
  } catch (error) {
    console.error("Error updating payment type:", error);

    return {
      success: false,
      error:
        getPaymentTypeErrorMessage(error) ??
        getDatabaseErrorMessage(error) ??
        "Failed to update payment type.",
    };
  }
}

export async function togglePaymentTypeActiveAction(
  id: string,
  active: boolean,
) {
  await requireAdmin();

  try {
    const paymentType = await togglePaymentTypeActive(id, active);

    if (!paymentType) {
      return {
        success: false,
        error: "Payment type not found.",
      };
    }

    return {
      success: true,
      data: paymentType,
    };
  } catch (error) {
    console.error("Error updating payment type status:", error);

    return {
      success: false,
      error:
        getPaymentTypeErrorMessage(error) ??
        getDatabaseErrorMessage(error) ??
        "Failed to update payment type status.",
    };
  }
}
