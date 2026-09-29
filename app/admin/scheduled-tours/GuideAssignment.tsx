"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { assignGuideAction, removeGuideAction } from "./guide-actions";

interface Guide {
  id: string;
  user: {
    firstName: string | null;
    lastName: string | null;
  } | null;
}

interface AssignedGuide {
  id: string;
  guideId: string;
  guide: Guide | null;
}

interface GuideAssignmentProps {
  externalId: number;
  guides: Guide[];
  assignedGuides: AssignedGuide[];
}

export default function GuideAssignment({
  externalId,
  guides,
  assignedGuides,
}: GuideAssignmentProps) {
  const router = useRouter();

  const [selectedGuideId, setSelectedGuideId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableGuides = guides.filter(
    (guide) =>
      !assignedGuides.some(
        (assignedGuide) => assignedGuide.guideId === guide.id,
      ),
  );

  const getGuideName = (guide: Guide) => {
    if (!guide.user) {
      return "Unknown Guide";
    }

    return `${guide.user.firstName ?? ""} ${guide.user.lastName ?? ""}`.trim();
  };

  const handleAssign = async () => {
    if (!selectedGuideId) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await assignGuideAction(externalId, selectedGuideId);

      if (!result.success) {
        setError(result.error ?? "Failed to assign guide.");
        return;
      }

      setSelectedGuideId("");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async (guideId: string) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await removeGuideAction(externalId, guideId);

      if (!result.success) {
        setError(result.error ?? "Failed to remove guide.");
        return;
      }

      router.refresh();
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-xl border bg-card">
      <div className="border-b px-6 py-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">Guides</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Manage the guides assigned to this scheduled tour.
            </p>
          </div>

          <span className="shrink-0 rounded-full bg-card-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground">
            {assignedGuides.length}{" "}
            {assignedGuides.length === 1 ? "guide" : "guides"}
          </span>
        </div>
      </div>

      <div className="space-y-5 p-6">
        {assignedGuides.length === 0 ? (
          <div className="rounded-md border border-dashed px-4 py-6 text-center">
            <p className="text-sm font-medium">No guides assigned</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Assign a guide using the selector below.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {assignedGuides.map((assignment) => (
              <div
                key={assignment.id}
                className="flex flex-col gap-4 rounded-lg bg-card-secondary p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {assignment.guide
                      ? getGuideName(assignment.guide)
                      : "Unknown Guide"}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Assigned guide
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemove(assignment.guideId)}
                  disabled={isSubmitting}
                  className="w-full rounded-md border px-3 py-2 text-sm font-medium text-error transition-colors hover:bg-error/10 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {availableGuides.length > 0 && (
          <div className="border-t pt-5">
            <label
              htmlFor="guide"
              className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground"
            >
              Assign guide
            </label>

            <div className="flex flex-col gap-3 sm:flex-row">
              <select
                id="guide"
                value={selectedGuideId}
                onChange={(event) => setSelectedGuideId(event.target.value)}
                disabled={isSubmitting}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary sm:flex-1"
              >
                <option value="">Select guide...</option>

                {availableGuides.map((guide) => (
                  <option key={guide.id} value={guide.id}>
                    {getGuideName(guide)}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleAssign}
                disabled={!selectedGuideId || isSubmitting}
                className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {isSubmitting ? "Saving..." : "Assign"}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div
            className="rounded-md bg-error px-4 py-3 text-sm text-error"
            role="alert"
          >
            {error}
          </div>
        )}
      </div>
    </section>
  );
}
