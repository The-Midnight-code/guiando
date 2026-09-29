"use client";

import { useEffect, useRef, useState } from "react";
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
  const travelerSelectorRef = useRef<HTMLDivElement>(null);

  const [selectedTravelerId, setSelectedTravelerId] = useState("");
  const [travelerSearch, setTravelerSearch] = useState("");
  const [openTravelerSelector, setOpenTravelerSelector] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        travelerSelectorRef.current &&
        !travelerSelectorRef.current.contains(event.target as Node)
      ) {
        setOpenTravelerSelector(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenTravelerSelector(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const availableTravelers = travelers.filter(
    (traveler) =>
      !assignedTravelers.some(
        (assignment) => assignment.travelerId === traveler.id,
      ),
  );

  const filteredTravelers = availableTravelers.filter((traveler) => {
    const search = travelerSearch.trim().toLowerCase();

    if (!search) {
      return true;
    }

    const fullName = `${traveler.firstName} ${traveler.lastName ?? ""}`
      .trim()
      .toLowerCase();

    return (
      fullName.includes(search) ||
      traveler.email?.toLowerCase().includes(search) ||
      traveler.phone?.toLowerCase().includes(search)
    );
  });

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
          <div className="rounded-lg bg-card-secondary px-4 py-8 text-center">
            <p className="text-sm font-medium">No travelers assigned</p>

            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              Assign an existing traveler using the selector below.
            </p>
          </div>
        ) : (
          assignedTravelers.map((assignment) => (
            <div
              key={assignment.id}
              className="flex flex-col gap-4 rounded-lg bg-card-secondary p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {assignment.traveler
                    ? getTravelerName(assignment.traveler)
                    : "Unknown Traveler"}
                </p>

                {assignment.traveler?.email && (
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {assignment.traveler.email}
                  </p>
                )}

                {assignment.traveler?.phone && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {assignment.traveler.phone}
                  </p>
                )}
              </div>

              <div className="flex w-full items-center gap-2 sm:w-auto">
                {assignment.traveler && (
                  <button
                    type="button"
                    onClick={() => onEdit(assignment.traveler!)}
                    disabled={isSubmitting}
                    className="flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors hover:bg-background disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
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
        <div className="mt-6 border-t pt-6">
          <div className="mb-3">
            <label
              htmlFor="traveler"
              className="block text-xs font-medium uppercase tracking-wide text-muted-foreground"
            >
              Assign traveler
            </label>

            <p className="mt-1 text-sm text-muted-foreground">
              Select an existing traveler to add to this tour.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div
              ref={travelerSelectorRef}
              className="relative w-full sm:flex-1"
            >
              <button
                type="button"
                onClick={() => setOpenTravelerSelector((value) => !value)}
                disabled={isSubmitting}
                className="flex w-full items-center justify-between rounded-md border bg-background px-3 py-2.5 text-left text-sm outline-none transition-colors hover:bg-card-secondary focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span
                  className={
                    selectedTravelerId
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }
                >
                  {selectedTravelerId
                    ? getTravelerName(
                        travelers.find(
                          (traveler) => traveler.id === selectedTravelerId,
                        )!,
                      )
                    : "Select traveler..."}
                </span>

                <span className="text-muted-foreground">⌄</span>
              </button>

              {openTravelerSelector && (
                <div className="absolute left-0 right-0 z-20 mt-2 overflow-hidden rounded-md border bg-card shadow-lg">
                  <div className="border-b p-2">
                    <input
                      type="text"
                      value={travelerSearch}
                      onChange={(event) =>
                        setTravelerSearch(event.target.value)
                      }
                      placeholder="Search traveler..."
                      autoFocus
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary"
                    />
                  </div>

                  <div className="max-h-64 overflow-y-auto p-1">
                    {filteredTravelers.length === 0 ? (
                      <p className="px-3 py-4 text-center text-sm text-muted-foreground">
                        No travelers found.
                      </p>
                    ) : (
                      filteredTravelers.map((traveler) => (
                        <button
                          key={traveler.id}
                          type="button"
                          onClick={() => {
                            setSelectedTravelerId(traveler.id);
                            setTravelerSearch("");
                            setOpenTravelerSelector(false);
                          }}
                          className="w-full rounded-md px-3 py-2 text-left transition-colors hover:bg-card-secondary"
                        >
                          <p className="text-sm font-medium">
                            {getTravelerName(traveler)}
                          </p>

                          {traveler.email && (
                            <p className="mt-0.5 truncate text-xs text-muted-foreground">
                              {traveler.email}
                            </p>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleAssign}
              disabled={!selectedTravelerId || isSubmitting}
              className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {isSubmitting ? "Saving..." : "Assign"}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div
          className="mt-4 rounded-md bg-error px-4 py-3 text-sm text-error"
          role="alert"
        >
          {error}
        </div>
      )}
    </div>
  );
}
