import Link from "next/link";

import { getAdminDashboardStats } from "@/lib/queries/admin";

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats();

  const cards = [
    {
      title: "Scheduled Tours",
      value: stats.scheduledTours,
      href: "/admin/scheduled-tours",
    },
    {
      title: "Tours",
      value: stats.tours,
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
            className="rounded-lg border bg-white p-6 transition hover:shadow-md"
          >
            <p className="text-sm font-medium text-gray-500">{card.title}</p>

            <p className="mt-2 text-3xl font-bold">{card.value}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
