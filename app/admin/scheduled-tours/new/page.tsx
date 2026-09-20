import {
  getPickupLocations,
  getAffiliates,
  getPaymentTypes,
} from "@/lib/queries/catalogs";

import { getActiveTours } from "@/lib/queries/tours";

import ScheduledTourForm from "./ScheduledTourForm";

import { getTravelers } from "@/lib/queries/travelers";

export default async function NewScheduledTourPage() {
  const [tours, pickupLocations, affiliates, paymentTypes] = await Promise.all([
    getActiveTours(),
    getPickupLocations(),
    getAffiliates(),
    getPaymentTypes(),
  ]);

  const travelers = await getTravelers();

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Create Scheduled Tour</h1>

          <p className="mt-1 text-sm text-gray-600">
            Create a new scheduled tour and assign its booking information.
          </p>
        </div>

        <ScheduledTourForm
          tours={tours}
          pickupLocations={pickupLocations}
          affiliates={affiliates}
          paymentTypes={paymentTypes}
          travelers={travelers}
        />
      </div>
    </main>
  );
}
