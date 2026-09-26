"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { deleteTourAction } from "./actions";

interface DeleteTourButtonProps {
  id: string;
  name: string;
}

export default function DeleteTourButton({ id, name }: DeleteTourButtonProps) {
  const router = useRouter();

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${name}"?`,
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);

    try {
      const result = await deleteTourAction(id);

      if (!result.success) {
        window.alert(result.error ?? "Failed to delete tour.");
        return;
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      window.alert("An unexpected error occurred.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-[#EF4444]  disabled:opacity-50"
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </button>
  );
}
