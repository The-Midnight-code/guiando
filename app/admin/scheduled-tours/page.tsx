import { getScheduledToursForAdmin } from "@/lib/queries/scheduledTours";
import ScheduledToursTable from "./ScheduledToursTable";

interface ScheduledToursPageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    date?: string;
    sortBy?: string;
    sortDirection?: string;
    page?: string;
    pageSize?: string;
  }>;
}

export default async function ScheduledToursPage({
  searchParams,
}: ScheduledToursPageProps) {
  const params = await searchParams;

  const search = params.search ?? "";
  const status = params.status ?? "all";
  const date = params.date ?? "";

  const sortBy =
    params.sortBy === "startTime" ||
    params.sortBy === "tour" ||
    params.sortBy === "status" ||
    params.sortBy === "guide"
      ? params.sortBy
      : "date";

  const sortDirection = params.sortDirection === "desc" ? "desc" : "asc";

  const page = Math.max(Number(params.page) || 1, 1);
  const requestedPageSize = Number(params.pageSize);

  const pageSize =
    requestedPageSize === 10 ||
    requestedPageSize === 20 ||
    requestedPageSize === 50 ||
    requestedPageSize === 100
      ? requestedPageSize
      : 20;

  const result = await getScheduledToursForAdmin({
    search,
    status,
    date,
    sortBy,
    sortDirection,
    page,
    pageSize,
  });

  return (
    <main className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Scheduled Tours</h1>

        <p className="text-sm text-gray-500">
          Manage scheduled tours and assignments.
        </p>
      </div>

      <ScheduledToursTable
        scheduledTours={result.items}
        total={result.total}
        page={result.page}
        pageSize={result.pageSize}
        totalPages={result.totalPages}
      />
    </main>
  );
}
