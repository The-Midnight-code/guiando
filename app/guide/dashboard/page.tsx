import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { getUserByClerkId } from "@/lib/queries/users";
import { getGuideUpcomingTours } from "@/lib/queries/guides";
import StatusBadge from "@/app/admin/scheduled-tours/StatusBadge";
import SignOutButton from "@/components/nav/SignOutButton";

export default async function GuideDashboardPage() {
  const { userId } = await auth();
  console.log("Clerk userId:", userId);

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await getUserByClerkId(userId);
  console.log("DB user:", user);

  if (!user) {
    redirect("/guide");
  }

  const upcomingTours = await getGuideUpcomingTours(user.id);

  return (
    <div className="space-y-8">
      <SignOutButton />
      <div>
        <h1 className="text-2xl font-semibold">Guide Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your upcoming assigned tours.
        </p>
      </div>

      <section className="rounded-lg border bg-card">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="font-semibold">Upcoming Tours</h2>
            <p className="text-sm text-muted-foreground">
              Tours assigned to you
            </p>
          </div>

          <Link
            href="/guide/scheduled-tours"
            className="text-sm font-medium hover:underline"
          >
            View all
          </Link>
        </div>

        {upcomingTours.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-muted-foreground">
            You have no upcoming tours.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Tour</th>
                  <th className="px-6 py-3 font-medium">Time</th>
                  <th className="px-6 py-3 font-medium">Pickup</th>
                  <th className="px-6 py-3 font-medium">People</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>

              <tbody>
                {upcomingTours.map((tour) => (
                  <tr key={tour.id} className="border-b last:border-0">
                    <td className="px-6 py-4">{tour.tourDate}</td>

                    <td className="px-6 py-4 font-medium">
                      <Link
                        href={`/guide/scheduled-tours/${tour.id}`}
                        className="hover:underline"
                      >
                        {tour.tourName}
                      </Link>
                    </td>

                    <td className="px-6 py-4">
                      {tour.startTime ?? "-"}
                      {tour.endTime ? ` - ${tour.endTime}` : ""}
                    </td>

                    <td className="px-6 py-4">{tour.pickupLocation}</td>

                    <td className="px-6 py-4">{tour.numberOfPeople ?? 0}</td>

                    <td className="px-6 py-4">
                      <StatusBadge status={tour.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
