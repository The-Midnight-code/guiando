"use server";

import {
  createPaymentType,
  updatePaymentType,
  togglePaymentTypeActive,
  type CreatePaymentTypeInput,
} from "@/lib/queries/paymentTypes";

export async function createPaymentTypeAction(input: CreatePaymentTypeInput) {
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
      error: "Failed to create payment type.",
    };
  }
}

export async function updatePaymentTypeAction(
  id: string,
  input: CreatePaymentTypeInput,
) {
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
      error: "Failed to update payment type.",
    };
  }
}

export async function togglePaymentTypeActiveAction(
  id: string,
  active: boolean,
) {
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
      error: "Failed to update payment type status.",
    };
  }
}
