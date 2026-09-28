import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { getUserByClerkId } from "@/lib/queries/users";
import { getGuideScheduledTours } from "@/lib/queries/guides";
import StatusBadge from "@/components/ui/StatusBadge";
import StatusFilter from "@/components/guide/StatusFilter";
import TourSearch from "@/components/guide/TourSearch";

interface GuideScheduledToursPageProps {
  searchParams: Promise<{
    status?: string;
    search?: string;
  }>;
}
export default async function GuideScheduledToursPage({
  searchParams,
}: GuideScheduledToursPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await getUserByClerkId(userId);

  if (!user) {
    redirect("/guide");
  }

  const { status, search } = await searchParams;

  const tours = await getGuideScheduledTours(user.id, status, search);

  const detailQuery = new URLSearchParams();

  if (status) {
    detailQuery.set("status", status);
  }

  if (search) {
    detailQuery.set("search", search);
  }

  const detailQueryString = detailQuery.toString();

  return (
    <main className="space-y-6 p-8">
      <div>
        <h1 className="text-2xl font-semibold">Scheduled Tours</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tours assigned to you.
        </p>
      </div>
      <div className="flex items-center justify-between gap-4">
        <TourSearch value={search} status={status} />

        <StatusFilter value={status} search={search} />
      </div>
      <section className="rounded-lg border bg-card">
        {tours.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <p className="text-sm font-medium">
              {search || status ? "No tours found" : "No scheduled tours"}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {search || status
                ? "Try adjusting your search or filter."
                : "You currently have no tours assigned to you."}
            </p>
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
                        href={
                          detailQueryString
                            ? `/guide/scheduled-tours/${tour.id}?${detailQueryString}`
                            : `/guide/scheduled-tours/${tour.id}`
                        }
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

                    <td className="px-6 py-4">
                      <Link
                        href={
                          detailQueryString
                            ? `/guide/scheduled-tours/${tour.id}?${detailQueryString}`
                            : `/guide/scheduled-tours/${tour.id}`
                        }
                        className="hover:underline"
                      >
                        {tour.numberOfPeople}
                      </Link>
                    </td>

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
