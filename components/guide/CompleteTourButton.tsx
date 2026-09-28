"use client";

import { useTransition } from "react";

import { completeScheduledTourAction } from "@/app/guide/scheduled-tours/[id]/actions";

interface CompleteTourButtonProps {
  id: string;
}

export default function CompleteTourButton({ id }: CompleteTourButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleComplete() {
    startTransition(async () => {
      await completeScheduledTourAction(id);
    });
  }

  return (
    <button
      type="button"
      onClick={handleComplete}
      disabled={isPending}
      className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isPending ? "Completing..." : "Mark as Completed"}
    </button>
  );
}
