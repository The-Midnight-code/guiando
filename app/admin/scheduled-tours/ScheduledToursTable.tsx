"use client";

import { useRouter, useSearchParams } from "next/navigation";
import ScheduledTourActions from "./ScheduledTourActions";
import DeleteScheduledTourButton from "./DeleteScheduledTourButton";
import StatusBadge from "./StatusBadge";
import DateFilter from "./DateFilter";
import Pagination from "./Pagination";

interface ScheduledTour {
  id: string;
  externalId: number | null;
  tourDate: string;
  startTime: string | null;
  endTime: string | null;
  numberOfPeople: number | null;
  status: string;
  tour: {
    name: string;
  } | null;
  pickupLocation: {
    name: string;
  } | null;
  guideAssignments: {
    guide: {
      user: {
        firstName: string | null;
        lastName: string | null;
      } | null;
    } | null;
  }[];
}

interface ScheduledToursTableProps {
  scheduledTours: ScheduledTour[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export default function ScheduledToursTable({
  scheduledTours,
  total,
  page,
  pageSize,
  totalPages,
}: ScheduledToursTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "all";
  const date = searchParams.get("date") ?? "";
  const sortBy = searchParams.get("sortBy") ?? "date";
  const sortDirection = searchParams.get("sortDirection") ?? "asc";

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (!value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    params.set("page", "1");

    router.push(`/admin/scheduled-tours?${params.toString()}`);
  };

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 md:flex-row">
        <input
          type="text"
          value={search}
          onChange={(event) =>
            updateParams({
              search: event.target.value,
            })
          }
          placeholder="Search tours..."
          className="rounded-md border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select
          value={status}
          onChange={(event) =>
            updateParams({
              status: event.target.value,
            })
          }
          className="rounded-md border px-4 py-2 text-sm"
        >
          <option value="all">All statuses</option>

          {Array.from(
            new Set(
              scheduledTours.map((scheduledTour) => scheduledTour.status),
            ),
          ).map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <DateFilter
          value={date}
          onChange={(value) =>
            updateParams({
              date: value,
            })
          }
        />
        <select
          value={sortBy}
          onChange={(event) =>
            updateParams({
              sortBy: event.target.value,
            })
          }
          className="rounded-md border px-4 py-2 text-sm"
        >
          <option value="date">Sort by Date</option>
          <option value="startTime">Sort by Start Time</option>
          <option value="tour">Sort by Tour</option>
          <option value="status">Sort by Status</option>
          <option value="guide">Sort by Guide</option>
        </select>

        <select
          value={sortDirection}
          onChange={(event) =>
            updateParams({
              sortDirection: event.target.value,
            })
          }
          className="rounded-md border px-4 py-2 text-sm"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
        <select
          value={pageSize}
          onChange={(event) =>
            updateParams({
              pageSize: event.target.value,
            })
          }
          className="rounded-md border px-4 py-2 text-sm"
        >
          <option value="10">10 per page</option>
          <option value="20">20 per page</option>
          <option value="50">50 per page</option>
          <option value="100">100 per page</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-2xl cardBg">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Tour</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Pickup</th>
              <th className="px-4 py-3">Guide</th>
              <th className="px-4 py-3">People</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {scheduledTours.map((scheduledTour) => (
              <tr key={scheduledTour.id}>
                <td className="px-4 py-3 text-gray-500">
                  {scheduledTour.externalId ?? "—"}
                </td>
                <td className="px-4 py-3 font-medium">
                  {scheduledTour.tour?.name ?? "—"}
                </td>

                <td className="px-4 py-3">{scheduledTour.tourDate}</td>

                <td className="px-4 py-3">
                  {scheduledTour.startTime ?? "—"}
                  {" - "}
                  {scheduledTour.endTime ?? "—"}
                </td>

                <td className="px-4 py-3">
                  {scheduledTour.pickupLocation?.name ?? "—"}
                </td>

                <td className="px-4 py-3">
                  {scheduledTour.guideAssignments.length > 0
                    ? scheduledTour.guideAssignments
                        .map((assignment) => {
                          const firstName =
                            assignment.guide?.user?.firstName ?? "";

                          const lastName =
                            assignment.guide?.user?.lastName ?? "";

                          return `${firstName} ${lastName}`.trim();
                        })
                        .filter(Boolean)
                        .join(", ") || "Unassigned"
                    : "Unassigned"}
                </td>

                <td className="px-4 py-3">
                  {scheduledTour.numberOfPeople ?? 0}
                </td>

                <td className="px-4 py-3">
                  <StatusBadge status={scheduledTour.status} />
                </td>

                <td className="px-4 py-3">
                  {scheduledTour.externalId !== null && (
                    <div className="flex items-center gap-2">
                      <ScheduledTourActions
                        externalId={scheduledTour.externalId}
                      />

                      <DeleteScheduledTourButton
                        externalId={scheduledTour.externalId}
                      />
                    </div>
                  )}
                </td>
              </tr>
            ))}

            {scheduledTours.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                  No scheduled tours found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} />

      <p className="mt-3 text-sm text-gray-500">
        Showing {scheduledTours.length} of {total}
      </p>
    </div>
  );
}
