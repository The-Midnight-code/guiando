"use client";

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
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <label
          htmlFor="startDate"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Start date
        </label>

        <input
          id="startDate"
          type="date"
          value={startDate}
          onChange={(event) => updateFilter("startDate", event.target.value)}
          className="w-full rounded-md border px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label
          htmlFor="endDate"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          End date
        </label>

        <input
          id="endDate"
          type="date"
          value={endDate}
          onChange={(event) => updateFilter("endDate", event.target.value)}
          className="w-full rounded-md border px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label
          htmlFor="tourTypeId"
          className="mb-1 block text-sm font-medium text-gray-700"
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

            router.push(`${pathname}?${params.toString()}`);
          }}
          className="w-full rounded-md border px-3 py-2 text-sm"
        >
          <option value="">All tour types</option>

          {tourTypes.map((tourType) => (
            <option key={tourType.id} value={tourType.id}>
              {tourType.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label
          htmlFor="tourId"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Tour
        </label>

        <select
          id="tourId"
          value={searchParams.get("tourId") ?? ""}
          onChange={(event) => updateFilter("tourId", event.target.value)}
          className="w-full rounded-md border px-3 py-2 text-sm"
        >
          <option value="">All tours</option>

          {tours.map((tour) => (
            <option key={tour.id} value={tour.id}>
              {tour.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label
          htmlFor="status"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Status
        </label>

        <select
          id="status"
          value={searchParams.get("status") ?? ""}
          onChange={(event) => updateFilter("status", event.target.value)}
          className="w-full rounded-md border px-3 py-2 text-sm"
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
