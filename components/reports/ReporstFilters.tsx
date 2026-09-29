"use client";
import { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

type TourType = {
  id: string;
  name: string;
};

type Tour = {
  id: string;
  name: string;
};

type ReportsFiltersProps = {
  tourTypes: TourType[];
  tours: Tour[];
  statuses: string[];
};

export default function ReportsFilters({
  tourTypes,
  tours,
  statuses,
}: ReportsFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const startDate = searchParams.get("startDate") ?? "";
  const endDate = searchParams.get("endDate") ?? "";
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  const [tourSearch, setTourSearch] = useState("");
  const [showTourOptions, setShowTourOptions] = useState(false);

  const selectedTourId = searchParams.get("tourId") ?? "";

  const selectedTour = tours.find((tour) => tour.id === selectedTourId);

  const filteredTours = tours.filter((tour) =>
    tour.name.toLowerCase().includes(tourSearch.toLowerCase()),
  );

  function updateFilter(name: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }

    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      <div className="relative">
        <label className="mb-1 block text-sm font-medium text-muted-foreground">
          Start date
        </label>

        <button
          type="button"
          onClick={() => setShowStartCalendar((value) => !value)}
          className="w-full rounded-md border bg-card px-3 py-2 text-left text-sm text-foreground hover:bg-card-secondary"
        >
          {startDate || "Select start date"}
        </button>

        {showStartCalendar && (
          <div className="absolute z-20 mt-2 rounded-lg border bg-card p-3 shadow-lg">
            <DayPicker
              mode="single"
              selected={
                startDate ? new Date(`${startDate}T00:00:00`) : undefined
              }
              onSelect={(date) => {
                if (!date) return;

                const value = date.toISOString().split("T")[0];

                updateFilter("startDate", value);
                setShowStartCalendar(false);
              }}
            />
          </div>
        )}
      </div>

      <div className="relative">
        <label className="mb-1 block text-sm font-medium text-muted-foreground">
          End date
        </label>

        <button
          type="button"
          onClick={() => setShowEndCalendar((value) => !value)}
          className="w-full rounded-md border bg-card px-3 py-2 text-left text-sm text-foreground hover:bg-card-secondary"
        >
          {endDate || "Select end date"}
        </button>

        {showEndCalendar && (
          <div className="absolute z-20 mt-2 rounded-lg border bg-card p-3 shadow-lg">
            <DayPicker
              mode="single"
              selected={endDate ? new Date(`${endDate}T00:00:00`) : undefined}
              onSelect={(date) => {
                if (!date) return;

                const value = date.toISOString().split("T")[0];

                updateFilter("endDate", value);
                setShowEndCalendar(false);
              }}
            />
          </div>
        )}
      </div>
      <div>
        <label
          htmlFor="tourTypeId"
          className="mb-1 block text-sm font-medium text-muted-foreground"
        >
          Tour Type
        </label>

        <select
          id="tourTypeId"
          value={searchParams.get("tourTypeId") ?? ""}
          onChange={(event) => {
            const params = new URLSearchParams(searchParams.toString());

            const value = event.target.value;

            if (value) {
              params.set("tourTypeId", value);
            } else {
              params.delete("tourTypeId");
            }

            params.delete("tourId");
            setTourSearch("");
            setShowTourOptions(false);

            router.push(`${pathname}?${params.toString()}`);
          }}
          className="w-full rounded-md border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        >
          <option value="">All tour types</option>

          {tourTypes.map((tourType) => (
            <option key={tourType.id} value={tourType.id}>
              {tourType.name}
            </option>
          ))}
        </select>
      </div>
      <div className="relative">
        <label className="mb-1 block text-sm font-medium text-muted-foreground">
          Tour
        </label>

        <button
          type="button"
          onClick={() => setShowTourOptions((value) => !value)}
          className="w-full rounded-md border bg-card px-3 py-2 text-left text-sm text-foreground hover:bg-card-secondary"
        >
          {selectedTour?.name ?? "All tours"}
        </button>

        {showTourOptions && (
          <div className="absolute z-20 mt-2 w-full rounded-lg border bg-card p-2 shadow-lg">
            <input
              type="text"
              value={tourSearch}
              onChange={(event) => setTourSearch(event.target.value)}
              placeholder="Search tours..."
              className="mb-2 w-full rounded-md border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              autoFocus
            />

            <div className="max-h-60 overflow-y-auto">
              <button
                type="button"
                onClick={() => {
                  updateFilter("tourId", "");
                  setTourSearch("");
                  setShowTourOptions(false);
                }}
                className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-card-secondary"
              >
                All tours
              </button>

              {filteredTours.map((tour) => (
                <button
                  key={tour.id}
                  type="button"
                  onClick={() => {
                    updateFilter("tourId", tour.id);
                    setTourSearch("");
                    setShowTourOptions(false);
                  }}
                  className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-card-secondary"
                >
                  {tour.name}
                </button>
              ))}

              {filteredTours.length === 0 && (
                <p className="px-3 py-2 text-sm text-muted-foreground">
                  No tours found.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
      <div>
        <label
          htmlFor="status"
          className="mb-1 block text-sm font-medium text-muted-foreground"
        >
          Status
        </label>

        <select
          id="status"
          value={searchParams.get("status") ?? ""}
          onChange={(event) => updateFilter("status", event.target.value)}
          className="w-full rounded-md border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        >
          <option value="">All statuses</option>

          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
