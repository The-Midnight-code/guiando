"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import TravelerAssignment from "./TravelerAssignment";
import TravelerForm from "./TravelerForm";
import { assignTravelerAction } from "./traveler-actions";

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

interface TravelersSectionProps {
  externalId: number;
  travelers: Traveler[];
  assignedTravelers: AssignedTraveler[];
}

export default function TravelersSection({
  externalId,
  travelers,
  assignedTravelers,
}: TravelersSectionProps) {
  const [showTravelerForm, setShowTravelerForm] = useState(false);
  const [editingTraveler, setEditingTraveler] = useState<Traveler | null>(null);

  const router = useRouter();

  const handleAddTraveler = () => {
    setEditingTraveler(null);
    setShowTravelerForm(true);
  };

  const handleEditTraveler = (traveler: Traveler) => {
    setEditingTraveler(traveler);
    setShowTravelerForm(true);
  };

  const handleTravelerSuccess = async (traveler: Traveler) => {
    if (!editingTraveler) {
      const result = await assignTravelerAction(externalId, traveler.id);

      if (!result.success) {
        console.error(result.error);
        return;
      }
    }

    setShowTravelerForm(false);
    setEditingTraveler(null);

    router.refresh();
  };

  const handleCancel = () => {
    setShowTravelerForm(false);
    setEditingTraveler(null);
  };

  return (
    <section className="rounded-xl border bg-card">
      <div className="flex flex-col gap-4 border-b px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-semibold">Travelers</h2>

            <span className="shrink-0 rounded-full bg-card-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground">
              {assignedTravelers.length}{" "}
              {assignedTravelers.length === 1 ? "traveler" : "travelers"}
            </span>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage travelers assigned to this tour.
          </p>
        </div>

        {!showTravelerForm && (
          <button
            type="button"
            onClick={handleAddTraveler}
            className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover sm:w-auto"
          >
            + New Traveler
          </button>
        )}
      </div>

      <div className="p-6">
        {showTravelerForm && (
          <div className="mb-6 rounded-lg bg-card-secondary p-5">
            <div className="mb-5 flex flex-col gap-1">
              <h3 className="text-sm font-semibold">
                {editingTraveler ? "Edit Traveler" : "New Traveler"}
              </h3>

              <p className="text-sm text-muted-foreground">
                {editingTraveler
                  ? "Update the traveler information."
                  : "Add a new traveler to this tour."}
              </p>
            </div>

            <TravelerForm
              initialData={editingTraveler}
              onSuccess={handleTravelerSuccess}
              onCancel={handleCancel}
            />
          </div>
        )}

        <div className={showTravelerForm ? "border-t pt-6" : ""}>
          <TravelerAssignment
            externalId={externalId}
            travelers={travelers}
            assignedTravelers={assignedTravelers}
            onEdit={handleEditTraveler}
          />
        </div>
      </div>
    </section>
  );
}
