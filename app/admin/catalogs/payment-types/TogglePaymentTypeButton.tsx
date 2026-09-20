"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { togglePaymentTypeActiveAction } from "./actions";

interface TogglePaymentTypeButtonProps {
  id: string;
  name: string;
  active: boolean;
}

export default function TogglePaymentTypeButton({
  id,
  name,
  active,
}: TogglePaymentTypeButtonProps) {
  const router = useRouter();

  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async () => {
    const nextStatus = !active;

    const confirmed = window.confirm(
      nextStatus
        ? `Are you sure you want to activate "${name}"?`
        : `Are you sure you want to deactivate "${name}"?`,
    );

    if (!confirmed) return;

    setIsUpdating(true);

    try {
      const result = await togglePaymentTypeActiveAction(id, nextStatus);

      if (!result.success) {
        window.alert(result.error ?? "Failed to update payment type status.");
        return;
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      window.alert("An unexpected error occurred.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isUpdating}
      className={
        active
          ? "text-red-600 hover:text-red-800 disabled:opacity-50"
          : "text-green-600 hover:text-green-800 disabled:opacity-50"
      }
    >
      {isUpdating ? "Updating..." : active ? "Deactivate" : "Activate"}
    </button>
  );
}
