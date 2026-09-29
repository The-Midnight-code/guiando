import { clerkClient } from "@clerk/nextjs/server";
import Link from "next/link";

import { getAdminDashboardStats, getUpcomingTours } from "@/lib/queries/admin";
import StatusBadge from "./scheduled-tours/StatusBadge";

export default async function AdminDashboardPage() {
  const [stats, upcomingTours] = await Promise.all([
    getAdminDashboardStats(),
    getUpcomingTours(),
  ]);

  const client = await clerkClient();

  const clerkIds = upcomingTours
    .map((tour) => tour.guideClerkId)
    .filter((clerkId): clerkId is string => Boolean(clerkId));

  const uniqueClerkIds = [...new Set(clerkIds)];

  const { data: clerkUsers } = await client.users.getUserList({
    userId: uniqueClerkIds,
  });

  const guideImageMap = new Map(
    clerkUsers.map((user) => [user.id, user.imageUrl]),
  );

  const upcomingToursWithImages = upcomingTours.map((tour) => ({
    ...tour,
    guideImageUrl: tour.guideClerkId
      ? (guideImageMap.get(tour.guideClerkId) ?? null)
      : null,
  }));

  const cards = [
    {
      title: "Scheduled Tours",
      value: stats.scheduledTours,
      href: "/admin/scheduled-tours",
    },
    {
      title: "Tours",
      value: stats.activeTours,
      href: "/admin/tours",
    },
    {
      title: "Guides",
      value: stats.guides,
      href: "/admin/guides",
    },
    {
      title: "Travelers",
      value: stats.travelers,
      href: "/admin/travelers",
    },
  ];

  return (
    <main className="space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Overview of your tour management system.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="rounded-xl border bg-card p-6 transition-colors hover:bg-card-secondary"
          >
            <p className="text-sm font-medium text-muted-foreground">
              {card.title}
            </p>

            <p className="mt-2 text-3xl font-semibold">{card.value}</p>
          </Link>
        ))}
      </section>

      <section className="overflow-hidden rounded-xl border bg-card">
        <div className="border-b px-6 py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold">Upcoming Tours</h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Your next scheduled tours.
              </p>
            </div>

            <Link
              href="/admin/scheduled-tours"
              className="text-sm font-medium text-primary transition-colors hover:text-primary-hover"
            >
              View all
            </Link>
          </div>
        </div>

        {upcomingTours.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-sm font-medium">No upcoming tours</p>

            <p className="mt-1 text-sm text-muted-foreground">
              There are currently no upcoming scheduled tours.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Date
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Tour
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Status
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Guide
                    </th>

                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      People
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {upcomingToursWithImages.map((tour) => {
                    const guideName =
                      [tour.guideFirstName, tour.guideLastName]
                        .filter(Boolean)
                        .join(" ") || "Unassigned";

                    return (
                      <tr
                        key={tour.id}
                        className="transition-colors hover:bg-card-secondary"
                      >
                        <td className="px-6 py-4 text-sm">
                          <Link
                            href={`/admin/scheduled-tours/${tour.externalId}`}
                            className="block"
                          >
                            {tour.tourDate}
                          </Link>
                        </td>

                        <td className="px-6 py-4 text-sm font-medium">
                          <Link
                            href={`/admin/scheduled-tours/${tour.externalId}`}
                            className="block"
                          >
                            {tour.tourName}
                          </Link>
                        </td>

                        <td className="px-6 py-4 text-sm">
                          <Link
                            href={`/admin/scheduled-tours/${tour.externalId}`}
                            className="block"
                          >
                            <StatusBadge status={tour.status} />
                          </Link>
                        </td>

                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          <Link
                            href={`/admin/scheduled-tours/${tour.externalId}`}
                            className="block"
                          >
                            <div className="flex items-center gap-2">
                              {tour.guideImageUrl ? (
                                <img
                                  src={tour.guideImageUrl}
                                  alt={guideName}
                                  className="h-7 w-7 rounded-full object-cover"
                                />
                              ) : (
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-card-secondary text-xs font-medium">
                                  {guideName !== "Unassigned"
                                    ? guideName.charAt(0).toUpperCase()
                                    : "—"}
                                </div>
                              )}

                              <span>{guideName}</span>
                            </div>
                          </Link>
                        </td>

                        <td className="px-6 py-4 text-right text-sm text-muted-foreground">
                          <Link
                            href={`/admin/scheduled-tours/${tour.externalId}`}
                            className="block"
                          >
                            {tour.numberOfPeople ?? "—"}
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="divide-y md:hidden">
              {upcomingToursWithImages.map((tour) => {
                const guideName =
                  [tour.guideFirstName, tour.guideLastName]
                    .filter(Boolean)
                    .join(" ") || "Unassigned";

                return (
                  <Link
                    key={tour.id}
                    href={`/admin/scheduled-tours/${tour.externalId}`}
                    className="block px-6 py-5 transition-colors hover:bg-card-secondary"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-medium">{tour.tourName}</p>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {tour.tourDate}
                        </p>
                      </div>

                      <StatusBadge status={tour.status} />
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Guide
                        </p>

                        <div className="mt-1 flex items-center gap-2">
                          {tour.guideImageUrl ? (
                            <img
                              src={tour.guideImageUrl}
                              alt={guideName}
                              className="h-7 w-7 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-card-secondary text-xs font-medium">
                              {guideName !== "Unassigned"
                                ? guideName.charAt(0).toUpperCase()
                                : "—"}
                            </div>
                          )}

                          <span>{guideName}</span>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          People
                        </p>

                        <p className="mt-1">{tour.numberOfPeople ?? "—"}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
