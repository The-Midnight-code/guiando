import { notFound } from "next/navigation";

import {
  getPickupLocations,
  getAffiliates,
  getPaymentTypes,
} from "@/lib/queries/catalogs";

import { getActiveTours } from "@/lib/queries/tours";

import { getScheduledTourById } from "@/lib/queries/scheduledTours";

import ScheduledTourForm from "../../new/ScheduledTourForm";
import { getTravelers } from "@/lib/queries/travelers";

interface EditScheduledTourPageProps {
  params: Promise<{
    externalId: string;
  }>;
}

export default async function EditScheduledTourPage({
  params,
}: EditScheduledTourPageProps) {
  const { externalId } = await params;

  const id = Number(externalId);

  if (Number.isNaN(id)) {
    notFound();
  }

  const [
    scheduledTour,
    tours,
    pickupLocations,
    affiliates,
    paymentTypes,
    travelers,
  ] = await Promise.all([
    getScheduledTourById(id),
    getActiveTours(),
    getPickupLocations(),
    getAffiliates(),
    getPaymentTypes(),
    getTravelers(),
  ]);

  if (!scheduledTour) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Edit Scheduled Tour</h1>

          <p className="mt-1 text-sm text-gray-600">
            Update the scheduled tour information.
          </p>
        </div>

        <ScheduledTourForm
          tours={tours}
          travelers={travelers}
          assignedTravelers={scheduledTour.travelerAssignments}
          pickupLocations={pickupLocations}
          affiliates={affiliates}
          paymentTypes={paymentTypes}
          externalId={scheduledTour.externalId ?? undefined}
          initialData={{
            tourId: scheduledTour.tourId,
            externalId: scheduledTour.externalId,
            status: scheduledTour.status,
            bookingDate: scheduledTour.bookingDate,
            tourDate: scheduledTour.tourDate,
            pickupLocationId: scheduledTour.pickupLocationId,
            affiliateId: scheduledTour.affiliateId,
            paymentTypeId: scheduledTour.paymentTypeId,
            startTime: scheduledTour.startTime,
            endTime: scheduledTour.endTime,
            locationStart: scheduledTour.locationStart,
            locationEnd: scheduledTour.locationEnd,
            specialIndications: scheduledTour.specialIndications,
            tip: scheduledTour.tip,
          }}
        />
      </div>
    </main>
  );
}
