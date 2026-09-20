import { notFound } from "next/navigation";
import { getScheduledTourById } from "@/lib/queries/scheduledTours";
import { getActiveGuides } from "@/lib/queries/guides";
import { getGuidesForScheduledTour } from "@/lib/queries/scheduledTourGuides";
import { getTravelers } from "@/lib/queries/travelers";
import { getTravelersForScheduledTour } from "@/lib/queries/scheduledTourTravelers";

import TravelersSection from "../TravelersSection";

import GuideAssignment from "../GuideAssignment";
import FinancialsForm from "../FinancialsForm";

interface ScheduledTourPageProps {
  params: Promise<{
    externalId: string;
  }>;
}

export default async function ScheduledTourPage({
  params,
}: ScheduledTourPageProps) {
  const { externalId } = await params;
  const id = Number(externalId);

  if (Number.isNaN(id)) {
    notFound();
  }

  const [scheduledTour, guides, assignedGuides, travelers, assignedTravelers] =
    await Promise.all([
      getScheduledTourById(id),
      getActiveGuides(),
      getGuidesForScheduledTour(id),
      getTravelers(),
      getTravelersForScheduledTour(id),
    ]);

  if (!scheduledTour) {
    notFound();
  }

  const tour = scheduledTour.tour;
  const financials = scheduledTour.financials;

  return (
    <main className="space-y-6 p-8">
      {/* Header */}
      <div>
        <p className="text-sm text-gray-500">
          Scheduled Tour #{scheduledTour.externalId}
        </p>

        <h1 className="text-3xl font-bold">{tour?.name}</h1>

        <p className="mt-1 text-gray-500">
          {tour?.description ?? "No description available"}
        </p>
      </div>

      {/* Basic information */}
      <section className="rounded-lg border p-6">
        <h2 className="mb-4 text-xl font-semibold">Tour Information</h2>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm text-gray-500">Product ID</p>
            <p className="font-medium">{tour?.productId ?? "N/A"}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Tour Type</p>
            <p className="font-medium">{tour?.tourType?.name ?? "N/A"}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Tour Class</p>
            <p className="font-medium">{tour?.tourClass?.name ?? "N/A"}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Duration</p>
            <p className="font-medium">
              {tour?.duration ? `${tour?.duration} minutes` : "N/A"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Base Price</p>
            <p className="font-medium">
              {tour?.price ? `$${tour.price} USD` : "N/A"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className="font-medium">{scheduledTour.status}</p>
          </div>
        </div>
      </section>

      {/* Schedule */}
      <section className="rounded-lg border p-6">
        <h2 className="mb-4 text-xl font-semibold">Schedule</h2>

        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <p className="text-sm text-gray-500">Booking Date</p>
            <p className="font-medium">{scheduledTour.bookingDate ?? "N/A"}</p>
          </div>

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
        </div>
      </section>

      {/* Pickup */}
      <section className="rounded-lg border p-6">
        <h2 className="mb-4 text-xl font-semibold">Pickup Information</h2>

        <div className="space-y-2">
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

          <p>
            <strong>Start:</strong> {scheduledTour.locationStart ?? "N/A"}
          </p>

          <p>
            <strong>End:</strong> {scheduledTour.locationEnd ?? "N/A"}
          </p>
        </div>
      </section>

      {/* Booking information */}
      <section className="rounded-lg border p-6">
        <h2 className="mb-4 text-xl font-semibold">Booking Information</h2>

        <div className="grid gap-4 md:grid-cols-4">
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
            <p className="text-sm text-gray-500">Number of People</p>
            <p className="font-medium">{scheduledTour.numberOfPeople ?? 0}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Tip</p>
            <p className="font-medium">${scheduledTour.tip ?? "0"}</p>
          </div>
        </div>

        {scheduledTour.specialIndications && (
          <div className="mt-4">
            <p className="text-sm text-gray-500">Special Indications</p>

            <p className="mt-1">{scheduledTour.specialIndications}</p>
          </div>
        )}
      </section>

      {/* Guides and travelers */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Guides */}
        <GuideAssignment
          externalId={id}
          guides={guides}
          assignedGuides={assignedGuides}
        />

        {/* Travelers */}
        <TravelersSection
          externalId={id}
          travelers={travelers}
          assignedTravelers={scheduledTour.travelerAssignments}
        />
      </div>

      {/* Financials */}
      <FinancialsForm
        externalId={id}
        numberOfPeople={scheduledTour.numberOfPeople ?? 0}
        initialData={
          scheduledTour.financials
            ? {
                totalPaymentUsd: scheduledTour.financials.totalPaymentUsd,
                exchangeRate: scheduledTour.financials.exchangeRate,
                guideCostMxn: scheduledTour.financials.guideCostMxn,
                transportationCostMxn:
                  scheduledTour.financials.transportationCostMxn,
                travelersCostMxn: scheduledTour.financials.travelersCostMxn,
                totalTravelersCostMxn:
                  scheduledTour.financials.totalTravelersCostMxn,
                extraExpensesMxn: scheduledTour.financials.extraExpensesMxn,
                totalCostMxn: scheduledTour.financials.totalCostMxn,
                totalCostUsd: scheduledTour.financials.totalCostUsd,
                totalRevenueUsd: scheduledTour.financials.totalRevenueUsd,
                revenuePercentage: scheduledTour.financials.revenuePercentage,
              }
            : null
        }
      />
    </main>
  );
}
