import { getScheduledTourById } from "@/lib/queries/scheduledTours";

interface TestScheduledTourPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TestScheduledTourPage({
  params,
}: TestScheduledTourPageProps) {
  const { id } = await params;

  const externalId = Number(id);
  const scheduledTour = await getScheduledTourById(externalId);

  if (!scheduledTour) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold">Scheduled Tour not found</h1>
      </main>
    );
  }

  return (
    <main className="p-8">
      <h1 className="mb-6 text-2xl font-bold">Scheduled Tour Details</h1>

      {/* Tour */}
      <section className="mb-6 rounded-lg border p-5">
        <h2 className="mb-3 text-xl font-semibold">
          {scheduledTour.tour?.name}
        </h2>

        <div className="space-y-1 text-sm">
          <p>
            <strong>Product ID:</strong>{" "}
            {scheduledTour.tour?.productId ?? "N/A"}
          </p>

          <p>
            <strong>Type:</strong> {scheduledTour.tour?.tourType?.name ?? "N/A"}
          </p>

          <p>
            <strong>Class:</strong>{" "}
            {scheduledTour.tour?.tourClass?.name ?? "N/A"}
          </p>
        </div>
      </section>

      {/* Schedule */}
      <section className="mb-6 rounded-lg border p-5">
        <h2 className="mb-3 text-xl font-semibold">Schedule</h2>

        <div className="space-y-1 text-sm">
          <p>
            <strong>Date:</strong> {scheduledTour.tourDate}
          </p>

          <p>
            <strong>Time:</strong> {scheduledTour.startTime ?? "N/A"} -{" "}
            {scheduledTour.endTime ?? "N/A"}
          </p>

          <p>
            <strong>Status:</strong> {scheduledTour.status}
          </p>

          <p>
            <strong>People:</strong> {scheduledTour.numberOfPeople ?? 0}
          </p>
        </div>
      </section>

      {/* Pickup */}
      <section className="mb-6 rounded-lg border p-5">
        <h2 className="mb-3 text-xl font-semibold">Pickup</h2>

        <p>
          <strong>Location:</strong> {scheduledTour.pickupLocation?.name}
        </p>

        <p>
          <strong>Address:</strong> {scheduledTour.pickupLocation?.address}
        </p>

        {scheduledTour.pickupLocation?.instructions && (
          <p>
            <strong>Instructions:</strong>{" "}
            {scheduledTour.pickupLocation.instructions}
          </p>
        )}
      </section>

      {/* Guides */}
      <section className="mb-6 rounded-lg border p-5">
        <h2 className="mb-3 text-xl font-semibold">Guides</h2>

        {scheduledTour.guideAssignments.length === 0 ? (
          <p>No guides assigned.</p>
        ) : (
          <ul className="list-disc pl-5">
            {scheduledTour.guideAssignments.map((assignment) => (
              <li key={assignment.id}>
                {assignment.guide?.user?.firstName}{" "}
                {assignment.guide?.user?.lastName}
                {" — "}
                {assignment.guide?.user?.email}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Travelers */}
      <section className="mb-6 rounded-lg border p-5">
        <h2 className="mb-3 text-xl font-semibold">Travelers</h2>

        {scheduledTour.travelerAssignments.length === 0 ? (
          <p>No travelers assigned.</p>
        ) : (
          <ul className="list-disc pl-5">
            {scheduledTour.travelerAssignments.map((assignment) => (
              <li key={assignment.id}>
                {assignment.traveler?.firstName} {assignment.traveler?.lastName}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Financials */}
      <section className="rounded-lg border p-5">
        <h2 className="mb-3 text-xl font-semibold">Financials</h2>

        {!scheduledTour.financials ? (
          <p>No financial information.</p>
        ) : (
          <div className="space-y-1 text-sm">
            <p>
              <strong>Total Payment:</strong> $
              {scheduledTour.financials.totalPaymentUsd ?? "0"} USD
            </p>

            <p>
              <strong>Guide Cost:</strong> $
              {scheduledTour.financials.guideCostMxn ?? "0"} MXN
            </p>

            <p>
              <strong>Transportation:</strong> $
              {scheduledTour.financials.transportationCostMxn ?? "0"} MXN
            </p>

            <p>
              <strong>Total Cost:</strong> $
              {scheduledTour.financials.totalCostMxn ?? "0"} MXN
            </p>

            <p>
              <strong>Total Revenue:</strong> $
              {scheduledTour.financials.totalRevenueUsd ?? "0"} USD
            </p>

            <p>
              <strong>Revenue Percentage:</strong>{" "}
              {scheduledTour.financials.revenuePercentage ?? "0"}%
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
