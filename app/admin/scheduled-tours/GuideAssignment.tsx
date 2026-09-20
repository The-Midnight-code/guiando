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
    <section className="rounded-lg bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">Guides</h2>

      <div className="mt-4 space-y-3">
        {assignedGuides.length === 0 ? (
          <p className="text-sm text-gray-500">No guides assigned.</p>
        ) : (
          assignedGuides.map((assignment) => (
            <div
              key={assignment.id}
              className="flex items-center justify-between rounded-md border p-3"
            >
              <span className="text-sm font-medium">
                {assignment.guide
                  ? getGuideName(assignment.guide)
                  : "Unknown Guide"}
              </span>

              <button
                type="button"
                onClick={() => handleRemove(assignment.guideId)}
                disabled={isSubmitting}
                className="rounded-md bg-red-600 px-3 py-2 text-sm text-white disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>

      {availableGuides.length > 0 && (
        <div className="mt-5 flex gap-2">
          <select
            value={selectedGuideId}
            onChange={(event) => setSelectedGuideId(event.target.value)}
            disabled={isSubmitting}
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
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
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Assign"}
          </button>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </section>
  );
}
