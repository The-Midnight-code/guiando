"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  createScheduledTourAction,
  updateScheduledTourAction,
} from "../actions";

import TravelerForm from "../TravelerForm";
import {
  assignTravelerAction,
  removeTravelerAction,
} from "../traveler-actions";

interface CatalogItem {
  id: string;
  name: string;
}

interface ScheduledTourFormProps {
  tours: CatalogItem[];
  pickupLocations: CatalogItem[];
  affiliates: CatalogItem[];
  paymentTypes: CatalogItem[];
  initialData?: {
    tourId: string;
    externalId?: number | null;
    status: string;
    bookingDate?: string | null;
    tourDate: string;
    pickupLocationId: string;
    affiliateId?: string | null;
    paymentTypeId?: string | null;
    startTime?: string | null;
    endTime?: string | null;
    locationStart?: string | null;
    locationEnd?: string | null;
    specialIndications?: string | null;
    tip?: string | null;
  };
  externalId?: number;
  travelers: Traveler[];
  assignedTravelers?: AssignedTraveler[];
}

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

export default function ScheduledTourForm({
  tours,
  pickupLocations,
  affiliates,
  paymentTypes,
  initialData,
  externalId,
  travelers,
  assignedTravelers,
}: ScheduledTourFormProps) {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    tourId: initialData?.tourId ?? "",
    externalId: initialData?.externalId?.toString() ?? "",
    status: initialData?.status ?? "PENDING",
    bookingDate: initialData?.bookingDate ?? "",
    tourDate: initialData?.tourDate ?? "",
    pickupLocationId: initialData?.pickupLocationId ?? "",
    affiliateId: initialData?.affiliateId ?? "",
    paymentTypeId: initialData?.paymentTypeId ?? "",
    startTime: initialData?.startTime ?? "",
    endTime: initialData?.endTime ?? "",
    locationStart: initialData?.locationStart ?? "",
    locationEnd: initialData?.locationEnd ?? "",
    specialIndications: initialData?.specialIndications ?? "",
    tip: initialData?.tip ?? "",
  });

  const [selectedTravelers, setSelectedTravelers] = useState<Traveler[]>(
    () =>
      assignedTravelers
        ?.map((assignment) => assignment.traveler)
        .filter((traveler): traveler is Traveler => traveler !== null) ?? [],
  );

  const [showTravelerForm, setShowTravelerForm] = useState(false);

  const handleAddTraveler = async (traveler: Traveler) => {
    const alreadySelected = selectedTravelers.some(
      (item) => item.id === traveler.id,
    );

    if (alreadySelected) {
      setShowTravelerForm(false);
      return;
    }

    setSelectedTravelers((current) => [...current, traveler]);

    if (externalId) {
      console.log("ASSIGNING TRAVELER:", {
        externalId,
        travelerId: traveler.id,
      });

      const result = await assignTravelerAction(externalId, traveler.id);

      console.log("ASSIGN TRAVELER RESULT:", result);

      if (!result.success) {
        setSelectedTravelers((current) =>
          current.filter((item) => item.id !== traveler.id),
        );

        setError(
          result.error ?? "Failed to assign traveler to scheduled tour.",
        );

        return;
      }
    }

    setShowTravelerForm(false);
  };

  const handleRemoveTraveler = async (travelerId: string) => {
    const traveler = selectedTravelers.find((item) => item.id === travelerId);

    if (!traveler) {
      return;
    }

    setSelectedTravelers((current) =>
      current.filter((item) => item.id !== travelerId),
    );

    if (externalId) {
      const result = await removeTravelerAction(externalId, travelerId);

      if (!result.success) {
        setSelectedTravelers((current) => [...current, traveler]);

        setError(
          result.error ?? "Failed to remove traveler from scheduled tour.",
        );
      }
    }
  };
  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = event.target;

    console.log("FIELD CHANGED:", name, value);

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const input = {
        tourId: formData.tourId,
        externalId: formData.externalId
          ? Number(formData.externalId)
          : undefined,
        status: formData.status,
        bookingDate: formData.bookingDate || undefined,
        tourDate: formData.tourDate,
        pickupLocationId: formData.pickupLocationId,
        affiliateId: formData.affiliateId || undefined,
        paymentTypeId: formData.paymentTypeId || undefined,
        startTime: formData.startTime || undefined,
        endTime: formData.endTime || undefined,
        locationStart: formData.locationStart || undefined,
        locationEnd: formData.locationEnd || undefined,
        numberOfPeople: selectedTravelers.length,
        specialIndications: formData.specialIndications || undefined,
        tip: formData.tip || undefined,
      };

      const result = externalId
        ? await updateScheduledTourAction(externalId, input)
        : await createScheduledTourAction(input);

      if (!result.success || !result.data) {
        setError(result.error ?? "Failed to save scheduled tour.");
        return;
      }

      if (!externalId) {
        const createdExternalId = result.data.externalId;

        if (createdExternalId == null) {
          setError(
            "Scheduled tour was created, but its external ID is missing.",
          );
          return;
        }

        const assignmentResults = await Promise.all(
          selectedTravelers.map((traveler) =>
            assignTravelerAction(createdExternalId, traveler.id),
          ),
        );

        const failedAssignment = assignmentResults.find(
          (assignment) => !assignment.success,
        );

        if (failedAssignment) {
          setError(
            failedAssignment.error ??
              "Scheduled tour created, but some travelers could not be assigned.",
          );
          return;
        }
      }

      router.push("/admin/scheduled-tours");
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Tour Information */}
      <section className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Tour Information</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="tourId" className="mb-1 block text-sm font-medium">
              Tour
            </label>

            <select
              id="tourId"
              name="tourId"
              value={formData.tourId}
              onChange={handleChange}
              required
              className="w-full rounded-md border px-3 py-2"
            >
              <option value="">Select a tour</option>

              {tours.map((tour) => (
                <option key={tour.id} value={tour.id}>
                  {tour.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="externalId"
              className="mb-1 block text-sm font-medium"
            >
              External ID
            </label>

            <input
              id="externalId"
              name="externalId"
              type="number"
              value={formData.externalId}
              onChange={handleChange}
              className="w-full rounded-md border px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="status" className="mb-1 block text-sm font-medium">
              Status
            </label>

            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="w-full rounded-md border px-3 py-2"
            >
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>
      </section>

      {/* Schedule */}
      <section className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Schedule</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="bookingDate"
              className="mb-1 block text-sm font-medium"
            >
              Booking Date
            </label>

            <input
              id="bookingDate"
              name="bookingDate"
              type="date"
              value={formData.bookingDate}
              onChange={handleChange}
              className="w-full rounded-md border px-3 py-2"
            />
          </div>

          <div>
            <label
              htmlFor="tourDate"
              className="mb-1 block text-sm font-medium"
            >
              Tour Date
            </label>

            <input
              id="tourDate"
              name="tourDate"
              type="date"
              value={formData.tourDate}
              onChange={handleChange}
              required
              className="w-full rounded-md border px-3 py-2"
            />
          </div>

          <div>
            <label
              htmlFor="startTime"
              className="mb-1 block text-sm font-medium"
            >
              Start Time
            </label>

            <input
              id="startTime"
              name="startTime"
              type="time"
              value={formData.startTime}
              onChange={handleChange}
              className="w-full rounded-md border px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="endTime" className="mb-1 block text-sm font-medium">
              End Time
            </label>

            <input
              id="endTime"
              name="endTime"
              type="time"
              value={formData.endTime}
              onChange={handleChange}
              className="w-full rounded-md border px-3 py-2"
            />
          </div>
        </div>
      </section>

      {/* Pickup */}
      <section className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Pickup Information</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="pickupLocationId"
              className="mb-1 block text-sm font-medium"
            >
              Pickup Location
            </label>

            <select
              id="pickupLocationId"
              name="pickupLocationId"
              value={formData.pickupLocationId}
              onChange={handleChange}
              required
              className="w-full rounded-md border px-3 py-2"
            >
              <option value="">Select pickup location</option>

              {pickupLocations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="numberOfPeople"
              className="mb-1 block text-sm font-medium"
            >
              Number of People
            </label>

            <input
              id="numberOfPeople"
              name="numberOfPeople"
              type="number"
              min="0"
              value={selectedTravelers.length}
              readOnly
              className="w-full rounded-md border px-3 py-2"
            />
          </div>

          <div>
            <label
              htmlFor="locationStart"
              className="mb-1 block text-sm font-medium"
            >
              Start Location
            </label>

            <input
              id="locationStart"
              name="locationStart"
              value={formData.locationStart}
              onChange={handleChange}
              className="w-full rounded-md border px-3 py-2"
            />
          </div>

          <div>
            <label
              htmlFor="locationEnd"
              className="mb-1 block text-sm font-medium"
            >
              End Location
            </label>

            <input
              id="locationEnd"
              name="locationEnd"
              value={formData.locationEnd}
              onChange={handleChange}
              className="w-full rounded-md border px-3 py-2"
            />
          </div>
        </div>
      </section>

      {/* Booking */}
      <section className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Booking Information</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="affiliateId"
              className="mb-1 block text-sm font-medium"
            >
              Affiliate
            </label>

            <select
              id="affiliateId"
              name="affiliateId"
              value={formData.affiliateId}
              onChange={handleChange}
              className="w-full rounded-md border px-3 py-2"
            >
              <option value="">Select affiliate</option>

              {affiliates.map((affiliate) => (
                <option key={affiliate.id} value={affiliate.id}>
                  {affiliate.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="paymentTypeId"
              className="mb-1 block text-sm font-medium"
            >
              Payment Type
            </label>

            <select
              id="paymentTypeId"
              name="paymentTypeId"
              value={formData.paymentTypeId}
              onChange={handleChange}
              className="w-full rounded-md border px-3 py-2"
            >
              <option value="">Select payment type</option>

              {paymentTypes.map((paymentType) => (
                <option key={paymentType.id} value={paymentType.id}>
                  {paymentType.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="tip" className="mb-1 block text-sm font-medium">
              Tip
            </label>

            <input
              id="tip"
              name="tip"
              type="number"
              step="0.01"
              min="0"
              value={formData.tip}
              onChange={handleChange}
              className="w-full rounded-md border px-3 py-2"
            />
          </div>
        </div>
      </section>

      {/* Notes */}
      <section className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Special Instructions</h2>

        <textarea
          id="specialIndications"
          name="specialIndications"
          rows={4}
          value={formData.specialIndications}
          onChange={handleChange}
          className="w-full rounded-md border px-3 py-2"
        />
      </section>

      {/* Travelers */}
      <section className="rounded-lg border bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Travelers</h2>

            <p className="mt-1 text-sm text-gray-500">
              Add travelers to this scheduled tour.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowTravelerForm(true)}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + New Traveler
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {selectedTravelers.length === 0 ? (
            <p className="text-sm text-gray-500">No travelers selected.</p>
          ) : (
            selectedTravelers.map((traveler) => (
              <div
                key={traveler.id}
                className="flex items-center justify-between rounded-md border bg-white p-3"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {`${traveler.firstName} ${traveler.lastName ?? ""}`.trim()}
                  </p>

                  {traveler.email && (
                    <p className="text-xs text-gray-500">{traveler.email}</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveTraveler(traveler.id)}
                  className="rounded-md bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>

        {travelers.filter(
          (traveler) =>
            !selectedTravelers.some((selected) => selected.id === traveler.id),
        ).length > 0 && (
          <div className="mt-5 flex gap-2">
            <select
              defaultValue=""
              onChange={(event) => {
                const traveler = travelers.find(
                  (item) => item.id === event.target.value,
                );

                if (traveler) {
                  handleAddTraveler(traveler);
                  event.target.value = "";
                }
              }}
              className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">Select existing traveler...</option>

              {travelers
                .filter(
                  (traveler) =>
                    !selectedTravelers.some(
                      (selected) => selected.id === traveler.id,
                    ),
                )
                .map((traveler) => (
                  <option key={traveler.id} value={traveler.id}>
                    {`${traveler.firstName} ${traveler.lastName ?? ""}`.trim()}
                  </option>
                ))}
            </select>
          </div>
        )}

        {showTravelerForm && (
          <div className="mt-5">
            <TravelerForm
              onSuccess={handleAddTraveler}
              onCancel={() => setShowTravelerForm(false)}
            />
          </div>
        )}
      </section>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border px-4 py-2"
          disabled={isSubmitting}
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {isSubmitting
            ? "Saving..."
            : externalId
              ? "Update Scheduled Tour"
              : "Create Scheduled Tour"}
        </button>
      </div>
    </div>
  );
}
