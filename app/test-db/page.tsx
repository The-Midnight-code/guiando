import { getScheduledToursForAdmin } from "@/lib/queries/scheduledTours";

export default async function TestDbPage() {
  const tours = await getScheduledToursForAdmin();

  return (
    <main className="p-8">
      <h1 className="mb-6 text-2xl font-bold">Scheduled Tours</h1>

      <div className="space-y-4">
        {tours.map((scheduledTour) => (
          <div key={scheduledTour.id} className="rounded-lg border p-4">
            <h2 className="font-semibold">{scheduledTour.tour?.name}</h2>

            <p>Date: {scheduledTour.tourDate}</p>

            <p>
              Time: {scheduledTour.startTime} - {scheduledTour.endTime}
            </p>

            <p>Status: {scheduledTour.status}</p>

            <p>Pickup: {scheduledTour.pickupLocation?.name}</p>

            <p>Affiliate: {scheduledTour.affiliate?.name ?? "N/A"}</p>

            <p>Payment: {scheduledTour.paymentType?.name ?? "N/A"}</p>

            <p>People: {scheduledTour.numberOfPeople ?? 0}</p>

            <div className="mt-3">
              <strong>Guides:</strong>

              {scheduledTour.guideAssignments.length === 0 ? (
                <span> No guides assigned</span>
              ) : (
                <ul className="list-disc pl-5">
                  {scheduledTour.guideAssignments.map((assignment) => (
                    <li key={assignment.id}>
                      {assignment.guide?.user?.firstName}{" "}
                      {assignment.guide?.user?.lastName}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
