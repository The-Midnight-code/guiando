"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { inviteGuideAction } from "./actions";

export default function InviteGuideForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSubmitting(true);
    setError(null);

    try {
      await inviteGuideAction(email);

      router.push("/admin/guides");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to send the invitation.",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium">
          Email
        </label>

        <input
          id="email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-md border bg-card px-3 py-2"
          placeholder="guide@example.com"
        />
      </div>

      {error && <p className="text-sm text-error">{error}</p>}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-card-secondary disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
        >
          {isSubmitting ? "Sending..." : "Send Invitation"}
        </button>
      </div>
    </form>
  );
}
