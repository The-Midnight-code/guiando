"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { updateGuideAction } from "./actions";

interface GuideFormProps {
  guideId: string;
  initialPhone: string | null;
  initialActive: boolean;
}

export default function GuideForm({
  guideId,
  initialPhone,
  initialActive,
}: GuideFormProps) {
  const router = useRouter();

  const [phone, setPhone] = useState(initialPhone ?? "");
  const [active, setActive] = useState(initialActive);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSubmitting(true);
    setError(null);

    try {
      await updateGuideAction(guideId, phone, active);

      router.push("/admin/guides");
      router.refresh();
    } catch {
      setError("Failed to update guide.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="phone" className="mb-1 block text-sm font-medium">
          Phone
        </label>

        <input
          id="phone"
          name="phone"
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          className="w-full rounded-md border bg-card px-3 py-2"
          placeholder="Enter phone number"
        />
      </div>

      <div className="flex items-center justify-between rounded-lg border bg-card-secondary p-4">
        <div>
          <p className="text-sm font-medium">Guide status</p>

          <p className="mt-1 text-sm text-muted-foreground">
            Inactive guides cannot be assigned to new tours.
          </p>
        </div>

        <label className="flex cursor-pointer items-center gap-3">
          <span className="text-sm">{active ? "Active" : "Inactive"}</span>

          <input
            type="checkbox"
            checked={active}
            onChange={(event) => setActive(event.target.checked)}
            className="h-4 w-4"
          />
        </label>
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
          {isSubmitting ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
