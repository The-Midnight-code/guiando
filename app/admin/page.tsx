import Link from "next/link";

import { getAdminDashboardStats, getUpcomingTours } from "@/lib/queries/admin";
import StatusBadge from "./scheduled-tours/StatusBadge";

export default async function AdminDashboardPage() {
  const [stats, upcomingTours] = await Promise.all([
    getAdminDashboardStats(),
    getUpcomingTours(),
  ]);

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
    <main className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        <p className="mt-1 text-sm text-gray-500">
          Overview of your tour management system.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="rounded-2xl cardBg p-6 transition hover:shadow-md border"
          >
            <p className="text-sm font-medium text-[#98a2b3]">{card.title}</p>

            <p className="mt-2 text-3xl font-bold">{card.value}</p>
          </Link>
        ))}
      </div>
      <section className="mt-8 rounded-2xl border bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Upcoming Tours</h2>

            <p className="mt-1 text-sm text-gray-500">
              Your next scheduled tours.
            </p>
          </div>

          <Link
            href="/admin/scheduled-tours"
            className="text-sm font-medium hover:underline"
          >
            View all
          </Link>
        </div>

        {upcomingTours.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-500">
            No upcoming tours found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Date
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Tour
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Status
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Guide
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">
                    People
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {upcomingTours.map((tour) => {
                  const guideName =
                    [tour.guideFirstName, tour.guideLastName]
                      .filter(Boolean)
                      .join(" ") || "Unassigned";

                  return (
                    <tr
                      key={tour.id}
                      className="cursor-pointer transition hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <Link
                          href={`/admin/scheduled-tours/${tour.externalId}`}
                          className="block"
                        >
                          {tour.tourDate}
                        </Link>
                      </td>

                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        <Link
                          href={`/admin/scheduled-tours/${tour.externalId}`}
                          className="block"
                        >
                          {tour.tourName}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Link
                          href={`/admin/scheduled-tours/${tour.externalId}`}
                          className="block"
                        >
                          <StatusBadge status={tour.status} />
                        </Link>
                      </td>

                      <td className="px-4 py-3 text-sm text-gray-600">
                        <Link
                          href={`/admin/scheduled-tours/${tour.externalId}`}
                          className="block"
                        >
                          {guideName}
                        </Link>
                      </td>

                      <td className="px-4 py-3 text-right text-sm text-gray-600">
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
        )}
      </section>
    </main>
  );
}
