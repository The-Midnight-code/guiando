"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

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

function parseDate(value: string) {
  if (!value) {
    return undefined;
  }

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return undefined;
  }

  return new Date(year, month - 1, day);
}

function formatDate(date: Date | undefined) {
  if (!date) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDisplayDate(value: string) {
  const date = parseDate(value);

  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatDisplayTime(value: string) {
  if (!value) {
    return "";
  }

  const [hours, minutes] = value.split(":").map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return "";
  }

  const date = new Date();

  date.setHours(hours, minutes, 0, 0);

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

const dayPickerClassNames = {
  months: "flex flex-col",
  month: "space-y-4",
  month_caption: "flex items-center justify-center px-2",
  caption_label: "text-sm font-medium",
  nav: "flex items-center gap-1",
  button_previous:
    "absolute left-1 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-card-secondary hover:text-foreground",
  button_next:
    "absolute right-1 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-card-secondary hover:text-foreground",
  month_grid: "w-full border-collapse",
  weekdays: "grid grid-cols-7",
  weekday: "py-2 text-center text-xs font-medium text-muted-foreground",
  week: "grid grid-cols-7",
  day: "relative flex items-center justify-center p-0",
  day_button:
    "h-9 w-9 rounded-md text-sm transition-colors hover:bg-card-secondary",
  selected: "bg-primary text-white hover:bg-primary-hover",
  today: "font-semibold text-primary",
  outside: "text-muted-foreground/40",
};

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
  const tourSelectorRef = useRef<HTMLDivElement>(null);
  const pickupLocationSelectorRef = useRef<HTMLDivElement>(null);
  const affiliateSelectorRef = useRef<HTMLDivElement>(null);

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
  const [openPicker, setOpenPicker] = useState<
    "bookingDate" | "tourDate" | "startTime" | "endTime" | null
  >(null);
  const [openPickupLocation, setOpenPickupLocation] = useState(false);
  const [openAffiliate, setOpenAffiliate] = useState(false);
  const [openPaymentType, setOpenPaymentType] = useState(false);
  const [openTravelerSelector, setOpenTravelerSelector] = useState(false);
  const [travelerSearch, setTravelerSearch] = useState("");
  const calendarRef = useRef<HTMLDivElement>(null);
  const [tourSearch, setTourSearch] = useState("");
  const [openTourSelector, setOpenTourSelector] = useState(false);
  const [pickupLocationSearch, setPickupLocationSearch] = useState("");
  const [affiliateSearch, setAffiliateSearch] = useState("");

  const filteredTours = tours.filter((tour) => {
    const search = tourSearch.trim().toLowerCase();

    if (!search) {
      return true;
    }

    return tour.name.toLowerCase().includes(search);
  });

  const filteredPickupLocations = pickupLocations.filter((location) => {
    const search = pickupLocationSearch.trim().toLowerCase();

    if (!search) {
      return true;
    }

    return location.name.toLowerCase().includes(search);
  });

  const filteredAffiliates = affiliates.filter((affiliate) => {
    const search = affiliateSearch.trim().toLowerCase();

    if (!search) {
      return true;
    }

    return affiliate.name.toLowerCase().includes(search);
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setOpenPicker(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tourSelectorRef.current &&
        !tourSelectorRef.current.contains(event.target as Node)
      ) {
        setOpenTourSelector(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenTourSelector(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickupLocationSelectorRef.current &&
        !pickupLocationSelectorRef.current.contains(event.target as Node)
      ) {
        setOpenPickupLocation(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenPickupLocation(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        affiliateSelectorRef.current &&
        !affiliateSelectorRef.current.contains(event.target as Node)
      ) {
        setOpenAffiliate(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenAffiliate(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

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

  const filteredTravelers = availableTravelers.filter((traveler) => {
    const fullName = `${traveler.firstName} ${traveler.lastName ?? ""}`
      .trim()
      .toLowerCase();

    const search = travelerSearch.trim().toLowerCase();

    return (
      fullName.includes(search) ||
      traveler.email?.toLowerCase().includes(search) ||
      traveler.phone?.toLowerCase().includes(search)
    );
  });

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

            <div ref={tourSelectorRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setOpenTourSelector((value) => {
                    const nextValue = !value;

                    if (!nextValue) {
                      setTourSearch("");
                    }

                    return nextValue;
                  });
                  setOpenPickupLocation(false);
                  setPickupLocationSearch("");

                  setOpenAffiliate(false);
                  setAffiliateSearch("");
                }}
                disabled={isSubmitting}
                className="flex w-full items-center justify-between rounded-md border bg-background px-3 py-2.5 text-left text-sm outline-none transition-colors hover:bg-card-secondary focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span
                  className={
                    formData.tourId
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }
                >
                  {formData.tourId
                    ? (tours.find((tour) => tour.id === formData.tourId)
                        ?.name ?? "Select tour...")
                    : "Select tour..."}
                </span>

                <span className="text-muted-foreground">⌄</span>
              </button>

              {openTourSelector && (
                <div className="absolute left-0 right-0 z-20 mt-2 overflow-hidden rounded-md border bg-card shadow-lg">
                  <div className="border-b p-2">
                    <input
                      type="text"
                      value={tourSearch}
                      onChange={(event) => setTourSearch(event.target.value)}
                      placeholder="Search tour..."
                      autoFocus
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary"
                    />
                  </div>

                  <div className="max-h-64 overflow-y-auto p-1">
                    {filteredTours.length === 0 ? (
                      <p className="px-3 py-4 text-center text-sm text-muted-foreground">
                        No tours found.
                      </p>
                    ) : (
                      filteredTours.map((tour) => (
                        <button
                          key={tour.id}
                          type="button"
                          onClick={() => {
                            setFormData((current) => ({
                              ...current,
                              tourId: tour.id,
                            }));
                            setTourSearch("");
                            setOpenTourSelector(false);
                          }}
                          className="w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-card-secondary"
                        >
                          {tour.name}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
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

        <div className="grid gap-5 p-6 md:grid-cols-2" ref={calendarRef}>
          <div className="relative">
            <label className={labelClassName}>Booking Date</label>

            <button
              type="button"
              onClick={() =>
                setOpenPicker((current) =>
                  current === "bookingDate" ? null : "bookingDate",
                )
              }
              className="mt-2 flex w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-left text-sm transition-colors hover:bg-card-secondary"
            >
              <span
                className={
                  formData.bookingDate
                    ? "text-foreground"
                    : "text-muted-foreground"
                }
              >
                {formData.bookingDate
                  ? formatDisplayDate(formData.bookingDate)
                  : "Select booking date"}
              </span>

              <span className="text-muted-foreground">▾</span>
            </button>

            {openPicker === "bookingDate" && (
              <div className="absolute z-20 mt-2 rounded-lg border bg-card p-3 shadow-xl">
                <DayPicker
                  mode="single"
                  selected={parseDate(formData.bookingDate)}
                  onSelect={(date) => {
                    setFormData((previous) => ({
                      ...previous,
                      bookingDate: formatDate(date),
                    }));

                    setOpenPicker(null);
                  }}
                  classNames={dayPickerClassNames}
                />
              </div>
            )}
          </div>

          <div className="relative">
            <label className={labelClassName}>Tour Date</label>

            <button
              type="button"
              onClick={() =>
                setOpenPicker((current) =>
                  current === "tourDate" ? null : "tourDate",
                )
              }
              className="mt-2 flex w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-left text-sm transition-colors hover:bg-card-secondary"
            >
              <span
                className={
                  formData.tourDate
                    ? "text-foreground"
                    : "text-muted-foreground"
                }
              >
                {formData.tourDate
                  ? formatDisplayDate(formData.tourDate)
                  : "Select tour date"}
              </span>

              <span className="text-muted-foreground">▾</span>
            </button>

            {openPicker === "tourDate" && (
              <div className="absolute z-20 mt-2 rounded-lg border bg-card p-3 shadow-xl">
                <DayPicker
                  mode="single"
                  selected={parseDate(formData.tourDate)}
                  onSelect={(date) => {
                    setFormData((previous) => ({
                      ...previous,
                      tourDate: formatDate(date),
                    }));

                    setOpenPicker(null);
                  }}
                  classNames={dayPickerClassNames}
                />
              </div>
            )}
          </div>

          <div className="relative">
            <label className={labelClassName}>Start Time</label>

            <button
              type="button"
              onClick={() =>
                setOpenPicker((current) =>
                  current === "startTime" ? null : "startTime",
                )
              }
              className="mt-2 flex w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-left text-sm transition-colors hover:bg-card-secondary"
            >
              <span
                className={
                  formData.startTime
                    ? "text-foreground"
                    : "text-muted-foreground"
                }
              >
                {formData.startTime
                  ? formatDisplayTime(formData.startTime)
                  : "Select start time"}
              </span>

              <span className="text-muted-foreground">▾</span>
            </button>

            {openPicker === "startTime" && (
              <div className="absolute z-20 mt-2 rounded-lg border bg-card p-4 shadow-xl">
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(event) => {
                    setFormData((previous) => ({
                      ...previous,
                      startTime: event.target.value,
                    }));
                  }}
                  autoFocus
                  className={inputClassName}
                />

                <button
                  type="button"
                  onClick={() => setOpenPicker(null)}
                  className="mt-3 w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
                >
                  Done
                </button>
              </div>
            )}
          </div>
          <div className="relative">
            <label className={labelClassName}>End Time</label>

            <button
              type="button"
              onClick={() =>
                setOpenPicker((current) =>
                  current === "endTime" ? null : "endTime",
                )
              }
              className="mt-2 flex w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-left text-sm transition-colors hover:bg-card-secondary"
            >
              <span
                className={
                  formData.endTime ? "text-foreground" : "text-muted-foreground"
                }
              >
                {formData.endTime
                  ? formatDisplayTime(formData.endTime)
                  : "Select end time"}
              </span>

              <span className="text-muted-foreground">▾</span>
            </button>

            {openPicker === "endTime" && (
              <div className="absolute z-20 mt-2 rounded-lg border bg-card p-4 shadow-xl">
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(event) => {
                    setFormData((previous) => ({
                      ...previous,
                      endTime: event.target.value,
                    }));
                  }}
                  autoFocus
                  className={inputClassName}
                />

                <button
                  type="button"
                  onClick={() => setOpenPicker(null)}
                  className="mt-3 w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
                >
                  Done
                </button>
              </div>
            )}
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
            <div ref={pickupLocationSelectorRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setOpenPickupLocation((value) => {
                    const nextValue = !value;

                    if (!nextValue) {
                      setPickupLocationSearch("");
                    }

                    return nextValue;
                  });
                  setOpenTourSelector(false);
                  setTourSearch("");

                  setOpenAffiliate(false);
                  setAffiliateSearch("");
                }}
                disabled={isSubmitting}
                className="flex w-full items-center justify-between rounded-md border bg-background px-3 py-2.5 text-left text-sm outline-none transition-colors hover:bg-card-secondary focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span
                  className={
                    formData.pickupLocationId
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }
                >
                  {formData.pickupLocationId
                    ? (pickupLocations.find(
                        (location) => location.id === formData.pickupLocationId,
                      )?.name ?? "Select pickup location...")
                    : "Select pickup location..."}
                </span>

                <span className="text-muted-foreground">⌄</span>
              </button>

              {openPickupLocation && (
                <div className="absolute left-0 right-0 z-20 mt-2 overflow-hidden rounded-md border bg-card shadow-lg">
                  <div className="border-b p-2">
                    <input
                      type="text"
                      value={pickupLocationSearch}
                      onChange={(event) =>
                        setPickupLocationSearch(event.target.value)
                      }
                      placeholder="Search pickup location..."
                      autoFocus
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary"
                    />
                  </div>

                  <div className="max-h-64 overflow-y-auto p-1">
                    {filteredPickupLocations.length === 0 ? (
                      <p className="px-3 py-4 text-center text-sm text-muted-foreground">
                        No pickup locations found.
                      </p>
                    ) : (
                      filteredPickupLocations.map((location) => (
                        <button
                          key={location.id}
                          type="button"
                          onClick={() => {
                            setFormData((current) => ({
                              ...current,
                              pickupLocationId: location.id,
                            }));
                            setPickupLocationSearch("");
                            setOpenPickupLocation(false);
                          }}
                          className="w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-card-secondary"
                        >
                          {location.name}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
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
              type="text"
              value={formData.locationStart}
              onChange={handleChange}
              placeholder="e.g. Hotel lobby, airport, or meeting point"
              className={inputClassName}
            />

            <p className="mt-2 text-xs text-muted-foreground">
              Specify where the tour starts.
            </p>
          </div>

          <div>
            <label htmlFor="locationEnd" className={labelClassName}>
              End Location
            </label>

            <input
              id="locationEnd"
              name="locationEnd"
              type="text"
              value={formData.locationEnd}
              onChange={handleChange}
              placeholder="e.g. Hotel, restaurant, or final destination"
              className={inputClassName}
            />

            <p className="mt-2 text-xs text-muted-foreground">
              Specify where the tour ends.
            </p>
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
          <div ref={affiliateSelectorRef} className="relative">
            <label className={labelClassName}>Affiliate</label>
            <button
              type="button"
              onClick={() => {
                setOpenAffiliate((value) => {
                  const nextValue = !value;

                  if (!nextValue) {
                    setAffiliateSearch("");
                  }

                  return nextValue;
                });
                setOpenTourSelector(false);
                setTourSearch("");

                setOpenPickupLocation(false);
                setPickupLocationSearch("");
                setOpenPaymentType(false);
              }}
              disabled={isSubmitting}
              className="mt-2 flex w-full items-center justify-between rounded-md border bg-background px-3 py-2.5 text-left text-sm outline-none transition-colors hover:bg-card-secondary focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span
                className={
                  formData.affiliateId
                    ? "text-foreground"
                    : "text-muted-foreground"
                }
              >
                {formData.affiliateId
                  ? (affiliates.find(
                      (affiliate) => affiliate.id === formData.affiliateId,
                    )?.name ?? "Select affiliate...")
                  : "Select affiliate..."}
              </span>

              <span className="text-muted-foreground">⌄</span>
            </button>

            {openAffiliate && (
              <div className="absolute left-0 right-0 z-20 mt-2 overflow-hidden rounded-md border bg-card shadow-lg">
                <div className="border-b p-2">
                  <input
                    type="text"
                    value={affiliateSearch}
                    onChange={(event) => setAffiliateSearch(event.target.value)}
                    placeholder="Search affiliate..."
                    autoFocus
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary"
                  />
                </div>

                <div className="max-h-64 overflow-y-auto p-1">
                  {filteredAffiliates.length === 0 ? (
                    <p className="px-3 py-4 text-center text-sm text-muted-foreground">
                      No affiliates found.
                    </p>
                  ) : (
                    filteredAffiliates.map((affiliate) => (
                      <button
                        key={affiliate.id}
                        type="button"
                        onClick={() => {
                          setFormData((current) => ({
                            ...current,
                            affiliateId: affiliate.id,
                          }));
                          setAffiliateSearch("");
                          setOpenAffiliate(false);
                        }}
                        className="w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-card-secondary"
                      >
                        {affiliate.name}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <label className={labelClassName}>Payment Type</label>
            <button
              type="button"
              onClick={() => {
                setOpenPaymentType((current) => !current);

                setOpenAffiliate(false);
                setAffiliateSearch("");
              }}
              className="mt-2 flex w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-left text-sm transition-colors hover:bg-card-secondary"
            >
              <span
                className={
                  formData.paymentTypeId
                    ? "text-foreground"
                    : "text-muted-foreground"
                }
              >
                {formData.paymentTypeId
                  ? paymentTypes.find(
                      (paymentType) =>
                        paymentType.id === formData.paymentTypeId,
                    )?.name
                  : "Select payment type"}
              </span>

              <span className="text-muted-foreground">▾</span>
            </button>

            {openPaymentType && (
              <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-lg border bg-card shadow-xl">
                {paymentTypes.map((paymentType) => (
                  <button
                    key={paymentType.id}
                    type="button"
                    onClick={() => {
                      setFormData((previous) => ({
                        ...previous,
                        paymentTypeId: paymentType.id,
                      }));

                      setOpenPaymentType(false);
                    }}
                    className="block w-full border-b px-4 py-3 text-left text-sm transition-colors last:border-b-0 hover:bg-card-secondary"
                  >
                    {paymentType.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="tip" className={labelClassName}>
              Tip
            </label>

            <div className="relative mt-2">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                $
              </span>

              <input
                id="tip"
                name="tip"
                type="number"
                step="0.01"
                min="0"
                value={formData.tip}
                onChange={handleChange}
                className={`${inputClassName} pl-7`}
                placeholder="0.00"
              />
            </div>

            <p className="mt-2 text-xs text-muted-foreground">
              Optional tip amount.
            </p>
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
            className={`${inputClassName} min-h-32 resize-y`}
            placeholder="Add any special instructions for the guide or tour..."
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
            <div className="rounded-lg border border-dashed px-4 py-8 text-center">
              <p className="text-sm font-medium">No travelers selected</p>

              <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
                Add an existing traveler or create a new one for this scheduled
                tour.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedTravelers.map((traveler) => (
                <div
                  key={traveler.id}
                  className="flex flex-col gap-4 rounded-lg border bg-background p-4 transition-colors hover:bg-card-secondary sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {`${traveler.firstName} ${traveler.lastName ?? ""}`.trim()}
                    </p>

                    {traveler.email && (
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {traveler.email}
                      </p>
                    )}

                    {traveler.phone && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {traveler.phone}
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
              <label className={labelClassName}>Assign Existing Traveler</label>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setOpenTravelerSelector((current) => {
                      const nextValue = !current;

                      if (!nextValue) {
                        setTravelerSearch("");
                      }

                      return nextValue;
                    });

                    setOpenTourSelector(false);
                    setTourSearch("");

                    setOpenPickupLocation(false);
                    setPickupLocationSearch("");

                    setOpenAffiliate(false);
                    setAffiliateSearch("");

                    setOpenPaymentType(false);
                  }}
                  className="mt-2 flex w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-left text-sm transition-colors hover:bg-card-secondary"
                >
                  <span className="text-muted-foreground">
                    Select existing traveler...
                  </span>

                  <span className="text-muted-foreground">▾</span>
                </button>

                {openTravelerSelector && (
                  <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-lg border bg-card shadow-xl">
                    <div className="border-b p-3">
                      <input
                        type="text"
                        value={travelerSearch}
                        onChange={(event) =>
                          setTravelerSearch(event.target.value)
                        }
                        placeholder="Search traveler..."
                        autoFocus
                        className={inputClassName}
                      />
                    </div>

                    <div className="max-h-64 overflow-y-auto">
                      {filteredTravelers.length === 0 ? (
                        <p className="px-4 py-4 text-center text-sm text-muted-foreground">
                          No travelers found.
                        </p>
                      ) : (
                        filteredTravelers.map((traveler) => (
                          <button
                            key={traveler.id}
                            type="button"
                            onClick={() => {
                              handleAddTraveler(traveler);
                              setTravelerSearch("");
                              setOpenTravelerSelector(false);
                            }}
                            className="block w-full border-b px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-card-secondary"
                          >
                            <p className="text-sm font-medium">
                              {`${traveler.firstName} ${
                                traveler.lastName ?? ""
                              }`.trim()}
                            </p>

                            {traveler.email && (
                              <p className="mt-1 text-xs text-muted-foreground">
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
          className="w-full rounded-md border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-card-secondary disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
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
