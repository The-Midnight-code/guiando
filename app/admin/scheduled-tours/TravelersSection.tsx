"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import TravelerAssignment from "./TravelerAssignment";
import TravelerForm from "./TravelerForm";

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

  const handleTravelerSuccess = () => {
    setShowTravelerForm(false);
    setEditingTraveler(null);

    router.refresh();
  };

  const handleCancel = () => {
    setShowTravelerForm(false);
    setEditingTraveler(null);
  };

  return (
    <section className="rounded-lg bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Travelers</h2>

          <p className="mt-1 text-sm text-gray-500">
            Manage travelers assigned to this tour.
          </p>
        </div>

        {!showTravelerForm && (
          <button
            type="button"
            onClick={handleAddTraveler}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + New Traveler
          </button>
        )}
      </div>

      {showTravelerForm && (
        <div className="mt-5">
          <TravelerForm
            initialData={editingTraveler}
            onSuccess={handleTravelerSuccess}
            onCancel={handleCancel}
          />
        </div>
      )}

      <div className="mt-5">
        <TravelerAssignment
          externalId={externalId}
          travelers={travelers}
          assignedTravelers={assignedTravelers}
          onEdit={handleEditTraveler}
        />
      </div>
    </section>
  );
}
