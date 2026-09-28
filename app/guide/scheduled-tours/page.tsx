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
    <main className="space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-semibold">Scheduled Tours</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tours assigned to you.
        </p>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
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
                  {tours.map((tour) => (
                    <tr
                      key={tour.id}
                      className="border-b last:border-0 transition-colors hover:bg-card-secondary"
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        {tour.tourDate}
                      </td>

                      <td className="px-6 py-4">
                        <Link
                          href={`/guide/scheduled-tours/${tour.id}${
                            detailQueryString ? `?${detailQueryString}` : ""
                          }`}
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
                          href={`/guide/scheduled-tours/${tour.id}${
                            detailQueryString ? `?${detailQueryString}` : ""
                          }`}
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
              {tours.map((tour) => (
                <div key={tour.id} className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {tour.tourDate}
                      </p>

                      <Link
                        href={`/guide/scheduled-tours/${tour.id}${
                          detailQueryString ? `?${detailQueryString}` : ""
                        }`}
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
                    href={`/guide/scheduled-tours/${tour.id}${
                      detailQueryString ? `?${detailQueryString}` : ""
                    }`}
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
    </main>
  );
}
