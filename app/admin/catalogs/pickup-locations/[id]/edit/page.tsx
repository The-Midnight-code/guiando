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
    <main className="space-y-6">
      <div>
        <Link
          href="/admin/catalogs/pickup-locations"
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          ← Back to Pickup Locations
        </Link>
      </div>

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
    </main>
  );
}
