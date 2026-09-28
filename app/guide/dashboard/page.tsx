import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { getUserByClerkId } from "@/lib/queries/users";
import {
  getGuideUpcomingTours,
  getGuideDashboardStats,
} from "@/lib/queries/guides";
import StatusBadge from "@/app/admin/scheduled-tours/StatusBadge";

export default async function GuideDashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await getUserByClerkId(userId);

  if (!user) {
    redirect("/guide");
  }

  const [upcomingTours, stats] = await Promise.all([
    getGuideUpcomingTours(user.id),
    getGuideDashboardStats(user.id),
  ]);

  return (
    <div className="space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm font-medium text-muted-foreground">
            Upcoming Tours
          </p>

          <p className="mt-3 text-3xl font-semibold tracking-tight">
            {stats.upcoming}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Tours scheduled ahead
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm font-medium text-muted-foreground">Today</p>

          <p className="mt-3 text-3xl font-semibold tracking-tight text-primary">
            {stats.today}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Tours scheduled for today
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm font-medium text-muted-foreground">Confirmed</p>

          <p className="mt-3 text-3xl font-semibold tracking-tight">
            {stats.confirmed}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Confirmed assigned tours
          </p>
        </div>
      </div>
      <section className="overflow-hidden rounded-xl border bg-card">
        <div className="flex items-center justify-between border-b px-6 py-5">
          <div>
            <h2 className="font-semibold">Upcoming Tours</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Tours assigned to you
            </p>
          </div>

          <Link
            href="/guide/scheduled-tours"
            className="text-sm font-medium text-primary transition-colors hover:text-primary-hover"
          >
            View all
          </Link>
        </div>

        {upcomingTours.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <p className="text-sm font-medium">No upcoming tours</p>

            <p className="mt-1 text-sm text-muted-foreground">
              You currently have no tours assigned to you.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Date
                    </th>

                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Tour
                    </th>

                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Time
                    </th>

                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Pickup
                    </th>

                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      People
                    </th>

                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Status
                    </th>

                    <th className="px-6 py-3" />
                  </tr>
                </thead>

                <tbody>
                  {upcomingTours.map((tour) => (
                    <tr
                      key={tour.id}
                      className="border-b last:border-0 transition-colors hover:bg-card-secondary"
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        {tour.tourDate}
                      </td>

                      <td className="px-6 py-4">
                        <Link
                          href={`/guide/scheduled-tours/${tour.id}`}
                          className="font-medium transition-colors hover:text-primary"
                        >
                          {tour.tourName}
                        </Link>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-muted-foreground">
                        {tour.startTime ?? "-"}
                        {tour.endTime ? ` - ${tour.endTime}` : ""}
                      </td>

                      <td className="px-6 py-4">{tour.pickupLocation}</td>

                      <td className="px-6 py-4">{tour.numberOfPeople ?? 0}</td>

                      <td className="px-6 py-4">
                        <StatusBadge status={tour.status} />
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/guide/scheduled-tours/${tour.id}`}
                          className="text-sm font-medium text-primary transition-colors hover:text-primary-hover"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="divide-y md:hidden">
              {upcomingTours.map((tour) => (
                <div key={tour.id} className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {tour.tourDate}
                      </p>

                      <Link
                        href={`/guide/scheduled-tours/${tour.id}`}
                        className="mt-1 block font-medium transition-colors hover:text-primary"
                      >
                        {tour.tourName}
                      </Link>
                    </div>

                    <StatusBadge status={tour.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Time</p>

                      <p className="mt-1">
                        {tour.startTime ?? "-"}
                        {tour.endTime ? ` - ${tour.endTime}` : ""}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">People</p>

                      <p className="mt-1">{tour.numberOfPeople ?? 0}</p>
                    </div>

                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">Pickup</p>

                      <p className="mt-1">{tour.pickupLocation}</p>
                    </div>
                  </div>

                  <Link
                    href={`/guide/scheduled-tours/${tour.id}`}
                    className="inline-flex text-sm font-medium text-primary transition-colors hover:text-primary-hover"
                  >
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
