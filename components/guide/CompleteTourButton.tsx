"use client";

import { useState, useTransition } from "react";

import { completeScheduledTourAction } from "@/app/guide/scheduled-tours/[id]/actions";

interface CompleteTourButtonProps {
  id: string;
}

export default function CompleteTourButton({ id }: CompleteTourButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleComplete() {
    setMessage(null);
    setError(null);

    startTransition(async () => {
      try {
        await completeScheduledTourAction(id);
        setMessage("Tour marked as completed.");
      } catch {
        setError("Unable to complete the tour. Please try again.");
      }
    });
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleComplete}
        disabled={isPending}
        className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Completing..." : "Mark as Completed"}
      </button>

      {message && (
        <p className="text-sm text-success" aria-live="polite">
          {message}
        </p>
      )}

      {error && (
        <p className="text-sm text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
