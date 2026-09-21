"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { deleteScheduledTourAction } from "../../scheduled-tours/actions";

interface DeleteButtonProps {
  externalId: number;
}

export default function DeleteButton({ externalId }: DeleteButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this scheduled tour?",
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);

    const result = await deleteScheduledTourAction(externalId);

    if (!result.success) {
      window.alert(result.error ?? "Failed to delete scheduled tour.");
      setIsDeleting(false);
      return;
    }

    router.push("/admin/scheduled-tours");
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isDeleting ? "Deleting..." : "Delete Scheduled Tour"}
    </button>
  );
}
