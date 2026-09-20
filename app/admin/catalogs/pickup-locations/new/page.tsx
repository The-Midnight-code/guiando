import Link from "next/link";

import PickupLocationForm from "../PickupLocationForm";

export default function NewPickupLocationPage() {
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

      <PickupLocationForm />
    </main>
  );
}
