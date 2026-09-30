"use server";
import { auth } from "@clerk/nextjs/server";

import { db } from "@/db/db";

import {
  createPaymentType,
  updatePaymentType,
  togglePaymentTypeActive,
  type CreatePaymentTypeInput,
} from "@/lib/queries/paymentTypes";

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
      error: "Failed to create payment type.",
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
      error: "Failed to update payment type.",
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
      error: "Failed to update payment type status.",
    };
  }
}
