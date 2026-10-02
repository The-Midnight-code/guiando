"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { assignGuideAction, removeGuideAction } from "./guide-actions";

interface Guide {
  id: string;
  user: {
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
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
  const guideDropdownRef = useRef<HTMLDivElement>(null);

  const [selectedGuideId, setSelectedGuideId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guideSearch, setGuideSearch] = useState("");
  const [isGuideDropdownOpen, setIsGuideDropdownOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        guideDropdownRef.current &&
        !guideDropdownRef.current.contains(event.target as Node)
      ) {
        setIsGuideDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getGuideName = (guide: Guide) => {
    if (!guide.user) {
      return "Unknown Guide";
    }

    return `${guide.user.firstName ?? ""} ${guide.user.lastName ?? ""}`.trim();
  };

  const availableGuides = guides.filter(
    (guide) =>
      !assignedGuides.some(
        (assignedGuide) => assignedGuide.guideId === guide.id,
      ),
  );

  const filteredGuides = availableGuides.filter((guide) =>
    getGuideName(guide)
      .toLowerCase()
      .includes(guideSearch.trim().toLowerCase()),
  );

  const selectedGuide = availableGuides.find(
    (guide) => guide.id === selectedGuideId,
  );

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
      setGuideSearch("");
      setIsGuideDropdownOpen(false);
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
                <div className="flex min-w-0 items-center gap-3">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-card">
                    {assignment.guide?.user?.imageUrl ? (
                      <Image
                        src={assignment.guide.user.imageUrl}
                        alt={
                          assignment.guide
                            ? getGuideName(assignment.guide)
                            : "Guide"
                        }
                        width={40}
                        height={40}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm font-medium text-muted-foreground">
                        {assignment.guide?.user?.firstName?.charAt(0) ?? "?"}
                      </div>
                    )}
                  </div>

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
              <div ref={guideDropdownRef} className="relative w-full sm:flex-1">
                <button
                  type="button"
                  onClick={() => setIsGuideDropdownOpen((current) => !current)}
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-left text-sm outline-none transition-colors hover:bg-card-secondary focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {selectedGuide ? (
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-card-secondary">
                        {selectedGuide.user?.imageUrl ? (
                          <Image
                            src={selectedGuide.user.imageUrl}
                            alt={getGuideName(selectedGuide)}
                            width={32}
                            height={32}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-xs font-medium text-muted-foreground">
                            {selectedGuide.user?.firstName?.charAt(0) ?? "?"}
                          </span>
                        )}
                      </span>

                      <span className="truncate">
                        {getGuideName(selectedGuide)}
                      </span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      Select guide...
                    </span>
                  )}

                  <span className="ml-2 shrink-0 text-muted-foreground">▾</span>
                </button>

                {isGuideDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-lg border bg-card p-2 shadow-xl">
                    <input
                      type="text"
                      value={guideSearch}
                      onChange={(event) => setGuideSearch(event.target.value)}
                      placeholder="Search guides..."
                      autoFocus
                      className="mb-2 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary"
                    />

                    <div className="max-h-60 overflow-y-auto">
                      {filteredGuides.length === 0 ? (
                        <p className="px-3 py-4 text-center text-sm text-muted-foreground">
                          No guides found.
                        </p>
                      ) : (
                        filteredGuides.map((guide) => (
                          <button
                            key={guide.id}
                            type="button"
                            onClick={() => {
                              setSelectedGuideId(guide.id);
                              setGuideSearch("");
                              setIsGuideDropdownOpen(false);
                            }}
                            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-card-secondary"
                          >
                            <span className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-card-secondary">
                              {guide.user?.imageUrl ? (
                                <Image
                                  src={guide.user.imageUrl}
                                  alt={getGuideName(guide)}
                                  width={32}
                                  height={32}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="flex h-full w-full items-center justify-center text-xs font-medium text-muted-foreground">
                                  {guide.user?.firstName?.charAt(0) ?? "?"}
                                </span>
                              )}
                            </span>

                            <span className="truncate text-sm font-medium">
                              {getGuideName(guide)}
                            </span>
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
