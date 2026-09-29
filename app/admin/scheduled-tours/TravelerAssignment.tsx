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
          <div className="rounded-md border border-dashed px-4 py-6 text-center">
            <p className="text-sm font-medium">No travelers assigned</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Assign a traveler using the selector below.
            </p>
          </div>
        ) : (
          assignedTravelers.map((assignment) => (
            <div
              key={assignment.id}
              className="flex flex-col gap-4 rounded-md border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {assignment.traveler
                    ? getTravelerName(assignment.traveler)
                    : "Unknown Traveler"}
                </p>

                {assignment.traveler?.email && (
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {assignment.traveler.email}
                  </p>
                )}
              </div>

              <div className="flex w-full items-center gap-2 sm:w-auto">
                {assignment.traveler && (
                  <button
                    type="button"
                    onClick={() => onEdit(assignment.traveler!)}
                    disabled={isSubmitting}
                    className="flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors hover:bg-card-secondary disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                  >
                    Edit
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleRemove(assignment.travelerId)}
                  disabled={isSubmitting}
                  className="flex-1 rounded-md border px-3 py-2 text-sm font-medium text-error transition-colors hover:bg-error/10 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {availableTravelers.length > 0 && (
        <div className="mt-5 border-t pt-5">
          <label
            htmlFor="traveler"
            className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground"
          >
            Assign traveler
          </label>

          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              id="traveler"
              value={selectedTravelerId}
              onChange={(event) => setSelectedTravelerId(event.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary sm:flex-1"
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
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {isSubmitting ? "Saving..." : "Assign"}
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-3 text-sm text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
