import Link from "next/link";

import TourTypeForm from "../TourTypeForm";

export default function NewTourTypePage() {
  return (
    <main className="space-y-6">
      <div>
        <Link
          href="/admin/catalogs/tour-types"
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          ← Back to Tour Types
        </Link>
      </div>

      <TourTypeForm />
    </main>
  );
}
