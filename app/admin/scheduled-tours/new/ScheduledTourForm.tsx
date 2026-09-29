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
      const result = await assignTravelerAction(externalId, traveler.id);

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

  const availableTravelers = travelers.filter(
    (traveler) =>
      !selectedTravelers.some((selected) => selected.id === traveler.id),
  );

  const inputClassName =
    "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary";

  const labelClassName =
    "mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground";

  return (
    <div className="space-y-6">
      {error && (
        <div
          className="rounded-md border border-error/30 bg-error/10 px-4 py-3 text-sm text-error"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Tour Information */}
      <section className="rounded-xl border bg-card">
        <div className="border-b px-6 py-5">
          <h2 className="font-semibold">Tour Information</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Select the tour and define its current status.
          </p>
        </div>

        <div className="grid gap-5 p-6 md:grid-cols-2">
          <div>
            <label htmlFor="tourId" className={labelClassName}>
              Tour
            </label>

            <select
              id="tourId"
              name="tourId"
              value={formData.tourId}
              onChange={handleChange}
              required
              className={inputClassName}
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
            <label htmlFor="externalId" className={labelClassName}>
              External ID
            </label>

            <input
              id="externalId"
              name="externalId"
              type="number"
              value={formData.externalId}
              onChange={handleChange}
              className={inputClassName}
            />
          </div>

          <div>
            <label htmlFor="status" className={labelClassName}>
              Status
            </label>

            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className={inputClassName}
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
      <section className="rounded-xl border bg-card">
        <div className="border-b px-6 py-5">
          <h2 className="font-semibold">Schedule</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Define the booking and tour schedule.
          </p>
        </div>

        <div className="grid gap-5 p-6 md:grid-cols-2">
          <div>
            <label htmlFor="bookingDate" className={labelClassName}>
              Booking Date
            </label>

            <input
              id="bookingDate"
              name="bookingDate"
              type="date"
              value={formData.bookingDate}
              onChange={handleChange}
              className={inputClassName}
            />
          </div>

          <div>
            <label htmlFor="tourDate" className={labelClassName}>
              Tour Date
            </label>

            <input
              id="tourDate"
              name="tourDate"
              type="date"
              value={formData.tourDate}
              onChange={handleChange}
              required
              className={inputClassName}
            />
          </div>

          <div>
            <label htmlFor="startTime" className={labelClassName}>
              Start Time
            </label>

            <input
              id="startTime"
              name="startTime"
              type="time"
              value={formData.startTime}
              onChange={handleChange}
              className={inputClassName}
            />
          </div>

          <div>
            <label htmlFor="endTime" className={labelClassName}>
              End Time
            </label>

            <input
              id="endTime"
              name="endTime"
              type="time"
              value={formData.endTime}
              onChange={handleChange}
              className={inputClassName}
            />
          </div>
        </div>
      </section>

      {/* Pickup */}
      <section className="rounded-xl border bg-card">
        <div className="border-b px-6 py-5">
          <h2 className="font-semibold">Pickup Information</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure pickup details and tour locations.
          </p>
        </div>

        <div className="grid gap-5 p-6 md:grid-cols-2">
          <div>
            <label htmlFor="pickupLocationId" className={labelClassName}>
              Pickup Location
            </label>

            <select
              id="pickupLocationId"
              name="pickupLocationId"
              value={formData.pickupLocationId}
              onChange={handleChange}
              required
              className={inputClassName}
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
            <label htmlFor="numberOfPeople" className={labelClassName}>
              Number of People
            </label>

            <input
              id="numberOfPeople"
              name="numberOfPeople"
              type="number"
              min="0"
              value={selectedTravelers.length}
              readOnly
              className={`${inputClassName} cursor-not-allowed bg-card-secondary text-muted-foreground`}
            />
          </div>

          <div>
            <label htmlFor="locationStart" className={labelClassName}>
              Start Location
            </label>

            <input
              id="locationStart"
              name="locationStart"
              value={formData.locationStart}
              onChange={handleChange}
              className={inputClassName}
            />
          </div>

          <div>
            <label htmlFor="locationEnd" className={labelClassName}>
              End Location
            </label>

            <input
              id="locationEnd"
              name="locationEnd"
              value={formData.locationEnd}
              onChange={handleChange}
              className={inputClassName}
            />
          </div>
        </div>
      </section>

      {/* Booking */}
      <section className="rounded-xl border bg-card">
        <div className="border-b px-6 py-5">
          <h2 className="font-semibold">Booking Information</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage affiliate, payment, and tip information.
          </p>
        </div>

        <div className="grid gap-5 p-6 md:grid-cols-2">
          <div>
            <label htmlFor="affiliateId" className={labelClassName}>
              Affiliate
            </label>

            <select
              id="affiliateId"
              name="affiliateId"
              value={formData.affiliateId}
              onChange={handleChange}
              className={inputClassName}
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
            <label htmlFor="paymentTypeId" className={labelClassName}>
              Payment Type
            </label>

            <select
              id="paymentTypeId"
              name="paymentTypeId"
              value={formData.paymentTypeId}
              onChange={handleChange}
              className={inputClassName}
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
            <label htmlFor="tip" className={labelClassName}>
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
              className={inputClassName}
            />
          </div>
        </div>
      </section>

      {/* Notes */}
      <section className="rounded-xl border bg-card">
        <div className="border-b px-6 py-5">
          <h2 className="font-semibold">Special Instructions</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Add any special instructions for this scheduled tour.
          </p>
        </div>

        <div className="p-6">
          <textarea
            id="specialIndications"
            name="specialIndications"
            rows={5}
            value={formData.specialIndications}
            onChange={handleChange}
            className={inputClassName}
            placeholder="Add special instructions..."
          />
        </div>
      </section>

      {/* Travelers */}
      <section className="rounded-xl border bg-card">
        <div className="flex flex-col gap-4 border-b px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold">Travelers</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Add travelers to this scheduled tour.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowTravelerForm(true)}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover sm:w-auto"
          >
            + New Traveler
          </button>
        </div>

        <div className="space-y-5 p-6">
          {selectedTravelers.length === 0 ? (
            <div className="rounded-md border border-dashed px-4 py-6 text-center">
              <p className="text-sm font-medium">No travelers selected</p>

              <p className="mt-1 text-sm text-muted-foreground">
                Add a traveler using the selector or create a new one.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedTravelers.map((traveler) => (
                <div
                  key={traveler.id}
                  className="flex flex-col gap-3 rounded-md border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {`${traveler.firstName} ${
                        traveler.lastName ?? ""
                      }`.trim()}
                    </p>

                    {traveler.email && (
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {traveler.email}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveTraveler(traveler.id)}
                    className="w-full rounded-md border px-3 py-2 text-sm font-medium text-error transition-colors hover:bg-error/10 sm:w-auto"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {availableTravelers.length > 0 && (
            <div className="border-t pt-5">
              <label htmlFor="existingTraveler" className={labelClassName}>
                Assign Existing Traveler
              </label>

              <select
                id="existingTraveler"
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
                className={inputClassName}
              >
                <option value="">Select existing traveler...</option>

                {availableTravelers.map((traveler) => (
                  <option key={traveler.id} value={traveler.id}>
                    {`${traveler.firstName} ${traveler.lastName ?? ""}`.trim()}
                  </option>
                ))}
              </select>
            </div>
          )}

          {showTravelerForm && (
            <div className="border-t pt-5">
              <TravelerForm
                onSuccess={handleAddTraveler}
                onCancel={() => setShowTravelerForm(false)}
              />
            </div>
          )}
        </div>
      </section>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="w-full rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-card-secondary disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
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
