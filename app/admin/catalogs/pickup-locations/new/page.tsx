import Link from "next/link";

import PickupLocationForm from "../PickupLocationForm";

export default function NewPickupLocationPage() {
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
        <PickupLocationForm />
      </div>
    </main>
  );
}
