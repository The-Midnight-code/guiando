import Link from "next/link";

import { getTourTypes, getTourClasses } from "@/lib/queries/catalogs";
import TourForm from "../TourForm";

export default async function NewTourPage() {
  const [tourTypes, tourClasses] = await Promise.all([
    getTourTypes(),
    getTourClasses(),
  ]);

  return (
    <main className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/admin/tours"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back to Tours
        </Link>
      </div>

      <div className="mx-auto max-w-5xl">
        <TourForm tourTypes={tourTypes} tourClasses={tourClasses} />
      </div>
    </main>
  );
}
