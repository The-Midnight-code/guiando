import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { getUserByClerkId } from "@/lib/queries/users";
import { getGuideUpcomingTours } from "@/lib/queries/guides";
import StatusBadge from "@/components/ui/StatusBadge";

export default async function GuideScheduledToursPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await getUserByClerkId(userId);

  if (!user) {
    redirect("/guide");
  }

  const tours = await getGuideUpcomingTours(user.id, 50);

  return (
    <main className="space-y-6 p-8">
      <div>
        <h1 className="text-2xl font-semibold">Scheduled Tours</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tours assigned to you.
        </p>
      </div>

      <section className="rounded-lg border bg-card">
        {tours.length === 0 ? (
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
                {tours.map((tour) => (
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
    </main>
  );
}
