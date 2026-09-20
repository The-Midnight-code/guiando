"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { assignTravelerAction, removeTravelerAction } from "./traveler-actions";

interface Traveler {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string | null;
  phone: string | null;
}

interface AssignedTraveler {
  id: string;
  travelerId: string;
  traveler: Traveler | null;
}

interface TravelerAssignmentProps {
  externalId: number;
  travelers: Traveler[];
  assignedTravelers: AssignedTraveler[];
  onEdit: (traveler: Traveler) => void;
}

export default function TravelerAssignment({
  externalId,
  travelers,
  assignedTravelers,
  onEdit,
}: TravelerAssignmentProps) {
  const router = useRouter();

  const [selectedTravelerId, setSelectedTravelerId] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const availableTravelers = travelers.filter(
    (traveler) =>
      !assignedTravelers.some(
        (assignment) => assignment.travelerId === traveler.id,
      ),
  );

  const getTravelerName = (traveler: Traveler) => {
    return `${traveler.firstName} ${traveler.lastName ?? ""}`.trim();
  };

  const handleAssign = async () => {
    if (!selectedTravelerId) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await assignTravelerAction(externalId, selectedTravelerId);

      if (!result.success) {
        setError(result.error ?? "Failed to assign traveler.");
        return;
      }

      setSelectedTravelerId("");

      router.refresh();
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async (travelerId: string) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await removeTravelerAction(externalId, travelerId);

      if (!result.success) {
        setError(result.error ?? "Failed to remove traveler.");
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
    <div>
      <div className="space-y-3">
        {assignedTravelers.length === 0 ? (
          <p className="text-sm text-gray-500">No travelers assigned.</p>
        ) : (
          assignedTravelers.map((assignment) => (
            <div
              key={assignment.id}
              className="flex items-center justify-between rounded-md border p-3"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {assignment.traveler
                    ? getTravelerName(assignment.traveler)
                    : "Unknown Traveler"}
                </p>

                {assignment.traveler?.email && (
                  <p className="text-xs text-gray-500">
                    {assignment.traveler.email}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {assignment.traveler && (
                  <button
                    type="button"
                    onClick={() => onEdit(assignment.traveler!)}
                    disabled={isSubmitting}
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Edit
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleRemove(assignment.travelerId)}
                  disabled={isSubmitting}
                  className="rounded-md bg-red-600 px-3 py-2 text-sm text-white disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {availableTravelers.length > 0 && (
        <div className="mt-5 flex gap-2">
          <select
            value={selectedTravelerId}
            onChange={(event) => setSelectedTravelerId(event.target.value)}
            disabled={isSubmitting}
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">Select traveler...</option>

            {availableTravelers.map((traveler) => (
              <option key={traveler.id} value={traveler.id}>
                {getTravelerName(traveler)}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleAssign}
            disabled={!selectedTravelerId || isSubmitting}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Assign"}
          </button>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
