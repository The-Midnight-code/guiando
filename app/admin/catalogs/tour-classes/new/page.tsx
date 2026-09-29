import Link from "next/link";

import TourClassForm from "../TourClassForm";

export default function NewTourClassPage() {
  return (
    <main className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/admin/catalogs/tour-classes"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back to Tour Classes
        </Link>
      </div>

      <div className="mx-auto max-w-5xl">
        <TourClassForm />
      </div>
    </main>
  );
}
