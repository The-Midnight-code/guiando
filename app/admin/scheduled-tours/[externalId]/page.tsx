import { notFound } from "next/navigation";

import { getScheduledTourById } from "@/lib/queries/scheduledTours";
import { getActiveGuides } from "@/lib/queries/guides";
import { getGuidesForScheduledTour } from "@/lib/queries/scheduledTourGuides";
import { getTravelers } from "@/lib/queries/travelers";

import TravelersSection from "../TravelersSection";
import GuideAssignment from "../GuideAssignment";
import FinancialsForm from "../FinancialsForm";

import BackButton from "./BackButton";
import EditButton from "./EditButton";
import DeleteButton from "./DeleteButton";
import StatusBadge from "../StatusBadge";

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

  const [scheduledTour, guides, assignedGuides, travelers] = await Promise.all([
    getScheduledTourById(id),
    getActiveGuides(),
    getGuidesForScheduledTour(id),
    getTravelers(),
  ]);

  if (!scheduledTour) {
    notFound();
  }

  const tour = scheduledTour.tour;

  return (
    <main className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <section className="rounded-xl border bg-card">
        <div className="flex flex-col gap-5 px-6 py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm text-muted-foreground">
                  Scheduled Tour #{scheduledTour.externalId}
                </p>

                <StatusBadge status={scheduledTour.status} />
              </div>

              <h1 className="mt-2 text-2xl font-semibold">
                {tour?.name ?? "Scheduled Tour"}
              </h1>

              <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
                {tour?.description ?? "No description available"}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <BackButton />
              <EditButton externalId={id} />
              <DeleteButton externalId={id} />
            </div>
          </div>
        </div>
      </section>

      {/* Tour Information */}
      <section className="rounded-xl border bg-card">
        <div className="border-b px-6 py-5">
          <h2 className="font-semibold">Tour Information</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Information about the selected tour.
          </p>
        </div>

        <div className="grid gap-5 p-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Product ID
            </p>

            <p className="mt-1 text-sm font-medium">
              {tour?.productId ?? "N/A"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Tour Type
            </p>

            <p className="mt-1 text-sm font-medium">
              {tour?.tourType?.name ?? "N/A"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Tour Class
            </p>

            <p className="mt-1 text-sm font-medium">
              {tour?.tourClass?.name ?? "N/A"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Duration
            </p>

            <p className="mt-1 text-sm font-medium">
              {tour?.duration ? `${tour.duration} minutes` : "N/A"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Base Price
            </p>

            <p className="mt-1 text-sm font-medium">
              {tour?.price ? `$${tour.price} USD` : "N/A"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Status
            </p>

            <div className="mt-1">
              <StatusBadge status={scheduledTour.status} />
            </div>
          </div>
        </div>
      </section>

      {/* Schedule */}
      <section className="rounded-xl border bg-card">
        <div className="border-b px-6 py-5">
          <h2 className="font-semibold">Schedule</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Booking and tour schedule.
          </p>
        </div>

        <div className="grid gap-5 p-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Booking Date
            </p>

            <p className="mt-1 text-sm font-medium">
              {scheduledTour.bookingDate ?? "N/A"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Tour Date
            </p>

            <p className="mt-1 text-sm font-medium">{scheduledTour.tourDate}</p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Start Time
            </p>

            <p className="mt-1 text-sm font-medium">
              {scheduledTour.startTime ?? "N/A"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              End Time
            </p>

            <p className="mt-1 text-sm font-medium">
              {scheduledTour.endTime ?? "N/A"}
            </p>
          </div>
        </div>
      </section>

      {/* Pickup Information */}
      <section className="rounded-xl border bg-card">
        <div className="border-b px-6 py-5">
          <h2 className="font-semibold">Pickup Information</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Pickup location and route information.
          </p>
        </div>

        <div className="grid gap-5 p-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Location
            </p>

            <p className="mt-1 text-sm font-medium">
              {scheduledTour.pickupLocation?.name ?? "N/A"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Address
            </p>

            <p className="mt-1 text-sm font-medium">
              {scheduledTour.pickupLocation?.address ?? "N/A"}
            </p>
          </div>

          {scheduledTour.pickupLocation?.instructions && (
            <div className="sm:col-span-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Instructions
              </p>

              <p className="mt-1 text-sm">
                {scheduledTour.pickupLocation.instructions}
              </p>
            </div>
          )}

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Start
            </p>

            <p className="mt-1 text-sm font-medium">
              {scheduledTour.locationStart ?? "N/A"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              End
            </p>

            <p className="mt-1 text-sm font-medium">
              {scheduledTour.locationEnd ?? "N/A"}
            </p>
          </div>
        </div>
      </section>

      {/* Booking Information */}
      <section className="rounded-xl border bg-card">
        <div className="border-b px-6 py-5">
          <h2 className="font-semibold">Booking Information</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Booking details and traveler information.
          </p>
        </div>

        <div className="grid gap-5 p-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Affiliate
            </p>

            <p className="mt-1 text-sm font-medium">
              {scheduledTour.affiliate?.name ?? "N/A"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Payment Type
            </p>

            <p className="mt-1 text-sm font-medium">
              {scheduledTour.paymentType?.name ?? "N/A"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Number of People
            </p>

            <p className="mt-1 text-sm font-medium">
              {scheduledTour.numberOfPeople ?? 0}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Tip
            </p>

            <p className="mt-1 text-sm font-medium">
              ${scheduledTour.tip ?? "0"}
            </p>
          </div>
        </div>

        {scheduledTour.specialIndications && (
          <div className="border-t px-6 py-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Special Indications
            </p>

            <p className="mt-1 text-sm">{scheduledTour.specialIndications}</p>
          </div>
        )}
      </section>

      {/* Guides and Travelers */}
      <div className="grid gap-6 lg:grid-cols-2">
        <GuideAssignment
          externalId={id}
          guides={guides}
          assignedGuides={assignedGuides}
        />

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
