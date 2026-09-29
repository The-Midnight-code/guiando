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

  const getGuideName = (scheduledTour: ScheduledTour) => {
    if (scheduledTour.guideAssignments.length === 0) {
      return "Unassigned";
    }

    return (
      scheduledTour.guideAssignments
        .map((assignment) => {
          const firstName = assignment.guide?.user?.firstName ?? "";
          const lastName = assignment.guide?.user?.lastName ?? "";

          return `${firstName} ${lastName}`.trim();
        })
        .filter(Boolean)
        .join(", ") || "Unassigned"
    );
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border bg-card">
        <div className="px-6 py-5">
          <h2 className="font-semibold">Filters</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Search, filter, and sort scheduled tours.
          </p>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <div className="xl:col-span-2">
            <label
              htmlFor="search"
              className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground"
            >
              Search
            </label>

            <input
              id="search"
              type="text"
              value={search}
              onChange={(event) =>
                updateParams({
                  search: event.target.value,
                })
              }
              placeholder="Search tours..."
              className="w-full rounded-md border bg-background px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
            />
          </div>

          <div>
            <label
              htmlFor="status"
              className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground"
            >
              Status
            </label>

            <select
              id="status"
              value={status}
              onChange={(event) =>
                updateParams({
                  status: event.target.value,
                })
              }
              className="w-full rounded-md border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary"
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
          </div>

          <div>
            <label
              htmlFor="date"
              className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground"
            >
              Date
            </label>

            <DateFilter
              value={date}
              onChange={(value) =>
                updateParams({
                  date: value,
                })
              }
            />
          </div>

          <div>
            <label
              htmlFor="sortBy"
              className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground"
            >
              Sort by
            </label>

            <select
              id="sortBy"
              value={sortBy}
              onChange={(event) =>
                updateParams({
                  sortBy: event.target.value,
                })
              }
              className="w-full rounded-md border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary"
            >
              <option value="date">Date</option>
              <option value="startTime">Start Time</option>
              <option value="tour">Tour</option>
              <option value="status">Status</option>
              <option value="guide">Guide</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="sortDirection"
              className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground"
            >
              Direction
            </label>

            <select
              id="sortDirection"
              value={sortDirection}
              onChange={(event) =>
                updateParams({
                  sortDirection: event.target.value,
                })
              }
              className="w-full rounded-md border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="pageSize"
              className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground"
            >
              Page size
            </label>

            <select
              id="pageSize"
              value={pageSize}
              onChange={(event) =>
                updateParams({
                  pageSize: event.target.value,
                })
              }
              className="w-full rounded-md border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary"
            >
              <option value="10">10 per page</option>
              <option value="20">20 per page</option>
              <option value="50">50 per page</option>
              <option value="100">100 per page</option>
            </select>
          </div>
        </div>
      </section>

      {scheduledTours.length === 0 ? (
        <section className="rounded-xl border bg-card">
          <div className="px-6 py-14 text-center">
            <p className="text-sm font-medium">No scheduled tours found</p>

            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your search or filters.
            </p>
          </div>
        </section>
      ) : (
        <>
          <section className="rounded-xl border bg-card">
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b bg-card-secondary/40">
                    <th className="px-6 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      ID
                    </th>

                    <th className="px-6 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Tour
                    </th>

                    <th className="px-6 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Date
                    </th>

                    <th className="px-6 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Time
                    </th>

                    <th className="px-6 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Pickup
                    </th>

                    <th className="px-6 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Guide
                    </th>

                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      People
                    </th>

                    <th className="px-6 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Status
                    </th>

                    <th className="px-6 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {scheduledTours.map((scheduledTour) => (
                    <tr
                      key={scheduledTour.id}
                      className="transition-colors duration-150 hover:bg-card-secondary"
                    >
                      <td className="px-6 py-3.5 text-sm text-muted-foreground">
                        {scheduledTour.externalId ?? "—"}
                      </td>

                      <td className="max-w-xs px-6 py-3.5 text-sm font-medium">
                        <p className="truncate">
                          {scheduledTour.tour?.name ?? "—"}
                        </p>
                      </td>

                      <td className="px-6 py-3.5 text-sm">
                        {scheduledTour.tourDate}
                      </td>

                      <td className="px-6 py-3.5 text-sm text-muted-foreground">
                        {scheduledTour.startTime ?? "—"}
                        {" - "}
                        {scheduledTour.endTime ?? "—"}
                      </td>

                      <td className="max-w-xs px-6 py-3.5 text-sm text-muted-foreground">
                        <p className="truncate">
                          {scheduledTour.pickupLocation?.name ?? "—"}
                        </p>
                      </td>

                      <td className="max-w-xs px-6 py-3.5 text-sm text-muted-foreground">
                        <p className="truncate">
                          {getGuideName(scheduledTour)}
                        </p>
                      </td>

                      <td className="px-6 py-3.5 text-right text-sm text-muted-foreground">
                        {scheduledTour.numberOfPeople ?? 0}
                      </td>

                      <td className="px-6 py-3.5">
                        <StatusBadge status={scheduledTour.status} />
                      </td>

                      <td className="whitespace-nowrap px-6 py-3.5">
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
                </tbody>
              </table>
            </div>

            <div className="divide-y md:hidden">
              {scheduledTours.map((scheduledTour) => (
                <div
                  key={scheduledTour.id}
                  className="px-6 py-5 transition-colors duration-150 hover:bg-card-secondary"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {scheduledTour.tour?.name ?? "—"}
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        ID: {scheduledTour.externalId ?? "—"}
                      </p>
                    </div>

                    <StatusBadge status={scheduledTour.status} />
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Date
                      </p>

                      <p className="mt-1">{scheduledTour.tourDate}</p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Time
                      </p>

                      <p className="mt-1">
                        {scheduledTour.startTime ?? "—"}
                        {" - "}
                        {scheduledTour.endTime ?? "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Pickup
                      </p>

                      <p className="mt-1 truncate">
                        {scheduledTour.pickupLocation?.name ?? "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Guide
                      </p>

                      <p className="mt-1 truncate">
                        {getGuideName(scheduledTour)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        People
                      </p>

                      <p className="mt-1">
                        {scheduledTour.numberOfPeople ?? 0}
                      </p>
                    </div>
                  </div>

                  {scheduledTour.externalId !== null && (
                    <div className="mt-5 flex flex-wrap items-center gap-2 border-t pt-4">
                      <ScheduledTourActions
                        externalId={scheduledTour.externalId}
                      />

                      <DeleteScheduledTourButton
                        externalId={scheduledTour.externalId}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-medium text-muted-foreground">
              Showing {scheduledTours.length} of {total} scheduled tours
            </p>

            <Pagination page={page} totalPages={totalPages} />
          </div>
        </>
      )}
    </div>
  );
}
