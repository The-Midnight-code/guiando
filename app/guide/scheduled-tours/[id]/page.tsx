import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { getUserByClerkId } from "@/lib/queries/users";
import { getScheduledTourByUuid } from "@/lib/queries/scheduledTours";
import StatusBadge from "@/components/ui/StatusBadge";
import CompleteTourButton from "@/components/guide/CompleteTourButton";
import Link from "next/link";

interface ScheduledTourPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    status?: string;
  }>;
}

export default async function GuideScheduledTourPage({
  params,
  searchParams,
}: ScheduledTourPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await getUserByClerkId(userId);

  if (!user) {
    redirect("/guide");
  }

  const { id } = await params;
  const { status } = await searchParams;

  const scheduledTour = await getScheduledTourByUuid(id, user.id);

  if (!scheduledTour) {
    notFound();
  }

  const tour = scheduledTour.tour;

  return (
    <main className="space-y-6 p-8">
      <Link
        href={
          status
            ? `/guide/scheduled-tours?status=${status}`
            : "/guide/scheduled-tours"
        }
        className="text-sm font-medium hover:underline"
      >
        ← Back to Scheduled Tours
      </Link>
      <div>
        <p className="text-sm text-gray-500">
          Scheduled Tour #{scheduledTour.externalId}
        </p>

        <h1 className="text-3xl font-bold">{tour?.name}</h1>

        <p className="mt-1 text-gray-500">
          {tour?.description ?? "No description available"}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <StatusBadge status={scheduledTour.status} />

        {scheduledTour.status === "CONFIRMED" && (
          <CompleteTourButton id={scheduledTour.id} />
        )}
      </div>

      <section className="rounded-lg border p-6">
        <h2 className="mb-4 text-xl font-semibold">Tour Information</h2>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm text-gray-500">Tour Type</p>
            <p className="font-medium">{tour?.tourType?.name ?? "N/A"}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Tour Class</p>
            <p className="font-medium">{tour?.tourClass?.name ?? "N/A"}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Status</p>
            <StatusBadge status={scheduledTour.status} />
          </div>
        </div>
      </section>

      <section className="rounded-lg border p-6">
        <h2 className="mb-4 text-xl font-semibold">Schedule</h2>

        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <p className="text-sm text-gray-500">Tour Date</p>
            <p className="font-medium">{scheduledTour.tourDate}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Start Time</p>
            <p className="font-medium">{scheduledTour.startTime ?? "N/A"}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">End Time</p>
            <p className="font-medium">{scheduledTour.endTime ?? "N/A"}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">People</p>
            <p className="font-medium">{scheduledTour.numberOfPeople ?? 0}</p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border p-6">
        <h2 className="mb-4 text-xl font-semibold">Pickup Information</h2>

        <div className="space-y-2">
          <p>
            <strong>Location:</strong>{" "}
            {scheduledTour.pickupLocation?.name ?? "N/A"}
          </p>

          <p>
            <strong>Address:</strong>{" "}
            {scheduledTour.pickupLocation?.address ?? "N/A"}
          </p>

          {scheduledTour.pickupLocation?.instructions && (
            <p>
              <strong>Instructions:</strong>{" "}
              {scheduledTour.pickupLocation.instructions}
            </p>
          )}

          <p>
            <strong>Start:</strong> {scheduledTour.locationStart ?? "N/A"}
          </p>

          <p>
            <strong>End:</strong> {scheduledTour.locationEnd ?? "N/A"}
          </p>
        </div>
      </section>

      <section className="rounded-lg border p-6">
        <h2 className="mb-4 text-xl font-semibold">Booking Information</h2>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm text-gray-500">Affiliate</p>
            <p className="font-medium">
              {scheduledTour.affiliate?.name ?? "N/A"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Payment Type</p>
            <p className="font-medium">
              {scheduledTour.paymentType?.name ?? "N/A"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Special Indications</p>
            <p className="font-medium">
              {scheduledTour.specialIndications ?? "N/A"}
            </p>
          </div>
        </div>
      </section>
      <section className="rounded-lg border p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Travelers</h2>
          <p className="text-sm text-gray-500">
            Travelers assigned to this tour.
          </p>
        </div>

        {scheduledTour.travelerAssignments.filter(
          (assignment) => assignment.traveler !== null,
        ).length === 0 ? (
          <p className="text-sm text-gray-500">No travelers assigned.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                </tr>
              </thead>

              <tbody>
                {scheduledTour.travelerAssignments.map((assignment) => {
                  const traveler = assignment.traveler;

                  if (!traveler) {
                    return null;
                  }

                  return (
                    <tr key={traveler.id} className="border-b last:border-0">
                      <td className="px-4 py-3 font-medium">
                        {traveler.firstName} {traveler.lastName}
                      </td>

                      <td className="px-4 py-3">{traveler.email ?? "-"}</td>

                      <td className="px-4 py-3">{traveler.phone ?? "-"}</td>
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
