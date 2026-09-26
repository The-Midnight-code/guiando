"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { deleteScheduledTourAction } from "./actions";
import { FiTrash2 } from "react-icons/fi";
interface DeleteScheduledTourButtonProps {
  externalId: number;
}

export default function DeleteScheduledTourButton({
  externalId,
}: DeleteScheduledTourButtonProps) {
  const router = useRouter();

  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this scheduled tour?",
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const result = await deleteScheduledTourAction(externalId);

      if (!result.success) {
        setError(result.error ?? "Failed to delete scheduled tour.");
        return;
      }

      router.refresh();
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <FiTrash2
        onClick={handleDelete}
        className="text-error text-lg"
      ></FiTrash2>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
