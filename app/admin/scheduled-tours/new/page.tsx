import {
  getPickupLocations,
  getAffiliates,
  getPaymentTypes,
} from "@/lib/queries/catalogs";

import { getActiveTours } from "@/lib/queries/tours";

import { getTravelers } from "@/lib/queries/travelers";

import ScheduledTourForm from "./ScheduledTourForm";

export default async function NewScheduledTourPage() {
  const [tours, pickupLocations, affiliates, paymentTypes] = await Promise.all([
    getActiveTours(),
    getPickupLocations(),
    getAffiliates(),
    getPaymentTypes(),
  ]);

  const travelers = await getTravelers();

  return (
    <main className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-semibold">Create Scheduled Tour</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Create a new scheduled tour and assign its booking information.
        </p>
      </div>

      <div className="mx-auto max-w-5xl">
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
