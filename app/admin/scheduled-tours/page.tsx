import { clerkClient } from "@clerk/nextjs/server";
import Link from "next/link";

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

  const guideImageMap = new Map<string, string>();

  const clerkIds = result.items
    .flatMap((scheduledTour) =>
      scheduledTour.guideAssignments.map(
        (assignment) => assignment.guide?.user?.clerkId,
      ),
    )
    .filter((clerkId): clerkId is string => Boolean(clerkId));

  const uniqueClerkIds = [...new Set(clerkIds)];

  if (uniqueClerkIds.length > 0) {
    const client = await clerkClient();

    const { data: clerkUsers } = await client.users.getUserList({
      userId: uniqueClerkIds,
    });

    for (const user of clerkUsers) {
      guideImageMap.set(user.id, user.imageUrl);
    }
  }

  const scheduledToursWithImages = result.items.map((scheduledTour) => ({
    ...scheduledTour,
    guideAssignments: scheduledTour.guideAssignments.map((assignment) => ({
      ...assignment,
      guide: assignment.guide
        ? {
            ...assignment.guide,
            user: assignment.guide.user
              ? {
                  ...assignment.guide.user,
                  imageUrl:
                    guideImageMap.get(assignment.guide.user.clerkId) ?? null,
                }
              : null,
          }
        : null,
    })),
  }));

  return (
    <main className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Scheduled Tours</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage scheduled tours and assignments.
          </p>
        </div>

        <Link
          href="/admin/scheduled-tours/new"
          className="w-full rounded-md bg-primary px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-primary-hover sm:w-auto"
        >
          New Scheduled Tour
        </Link>
      </div>

      <ScheduledToursTable
        scheduledTours={scheduledToursWithImages}
        total={result.total}
        page={result.page}
        pageSize={result.pageSize}
        totalPages={result.totalPages}
      />
    </main>
  );
}
