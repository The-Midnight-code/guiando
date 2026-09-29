import Link from "next/link";
import { notFound } from "next/navigation";

import { getPickupLocationById } from "@/lib/queries/pickupLocations";

import PickupLocationForm from "../../PickupLocationForm";

interface EditPickupLocationPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditPickupLocationPage({
  params,
}: EditPickupLocationPageProps) {
  const { id } = await params;

  const pickupLocation = await getPickupLocationById(id);

  if (!pickupLocation) {
    notFound();
  }

  return (
    <main className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/admin/catalogs/pickup-locations"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back to Pickup Locations
        </Link>
      </div>

      <div className="mx-auto max-w-5xl">
        <PickupLocationForm
          initialData={{
            id: pickupLocation.id,
            name: pickupLocation.name,
            address: pickupLocation.address,
            instructions: pickupLocation.instructions,
            latitude: pickupLocation.latitude,
            longitude: pickupLocation.longitude,
            active: pickupLocation.active,
          }}
        />
      </div>
    </main>
  );
}
