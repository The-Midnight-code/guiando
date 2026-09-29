"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  resendGuideInvitationAction,
  revokeGuideInvitationAction,
} from "./invite/actions";

interface PendingInvitationCardProps {
  invitationId: string;
  email: string;
}

export default function PendingInvitationCard({
  invitationId,
  email,
}: PendingInvitationCardProps) {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this invitation?",
    );

    if (!confirmed) {
      return;
    }
    setIsSubmitting(true);
    setError(null);

    try {
      await revokeGuideInvitationAction(invitationId);
      router.refresh();
    } catch {
      setError("Unable to cancel the invitation.");
      setIsSubmitting(false);
    }
  };
  const handleResend = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to resend this invitation?",
    );

    if (!confirmed) {
      return;
    }
    setIsSubmitting(true);
    setError(null);

    try {
      await resendGuideInvitationAction(invitationId);

      router.refresh();
    } catch {
      setError("Unable to resend the invitation.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/15 text-lg font-semibold text-primary">
            {email.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0">
            <p className="truncate font-medium">{email}</p>

            <p className="mt-1 text-sm text-warning">Pending</p>
          </div>
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={handleResend}
            disabled={isSubmitting}
            className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-card-secondary disabled:opacity-50"
          >
            {isSubmitting ? "Sending..." : "Resend"}
          </button>

          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-card-secondary disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-error">{error}</p>}
    </div>
  );
}
