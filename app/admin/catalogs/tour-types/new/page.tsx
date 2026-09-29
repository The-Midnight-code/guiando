import Link from "next/link";

import TourTypeForm from "../TourTypeForm";

export default function NewTourTypePage() {
  return (
    <main className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/admin/catalogs/tour-types"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back to Tour Types
        </Link>
      </div>

      <div className="mx-auto max-w-5xl">
        <TourTypeForm />
      </div>
    </main>
  );
}
