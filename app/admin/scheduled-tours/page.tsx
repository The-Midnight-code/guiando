import { getScheduledToursForAdmin } from "@/lib/queries/scheduledTours";
import DeleteScheduledTourButton from "./DeleteScheduledTourButton";

export default async function ScheduledToursPage() {
  const scheduledTours = await getScheduledToursForAdmin();

  return (
    <main className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Scheduled Tours</h1>

        <p className="text-sm text-gray-500">
          Manage scheduled tours and assignments.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-4 py-3">Tour</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Pickup</th>
              <th className="px-4 py-3">Guide</th>
              <th className="px-4 py-3">People</th>
              <th className="px-4 py-3">Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {scheduledTours.map((scheduledTour) => (
              <tr key={scheduledTour.id} className="border-b last:border-b-0">
                <td className="px-4 py-3 font-medium">
                  {scheduledTour.tour?.name}
                </td>

                <td className="px-4 py-3">{scheduledTour.tourDate}</td>

                <td className="px-4 py-3">
                  {scheduledTour.startTime ?? "—"}
                  {" - "}
                  {scheduledTour.endTime ?? "—"}
                </td>

                <td className="px-4 py-3">
                  {scheduledTour.pickupLocation?.name}
                </td>

                <td className="px-4 py-3">
                  {scheduledTour.guideAssignments.length > 0
                    ? scheduledTour.guideAssignments
                        .map(
                          (assignment) =>
                            `${assignment.guide?.user?.firstName} ${assignment.guide?.user?.lastName}`,
                        )
                        .join(", ")
                    : "Unassigned"}
                </td>

                <td className="px-4 py-3">
                  {scheduledTour.numberOfPeople ?? 0}
                </td>

                <td className="px-4 py-3">{scheduledTour.status}</td>
                <td className="px-4 py-3">
                  {scheduledTour.externalId !== null && (
                    <DeleteScheduledTourButton
                      externalId={scheduledTour.externalId}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
