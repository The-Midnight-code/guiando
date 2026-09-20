import Link from "next/link";

import { getTourTypes, getTourClasses } from "@/lib/queries/catalogs";
import TourForm from "../TourForm";

export default async function NewTourPage() {
  const [tourTypes, tourClasses] = await Promise.all([
    getTourTypes(),
    getTourClasses(),
  ]);

  return (
    <main className="space-y-6">
      <div>
        <Link
          href="/admin/tours"
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          ← Back to Tours
        </Link>
      </div>

      <TourForm tourTypes={tourTypes} tourClasses={tourClasses} />
    </main>
  );
}
