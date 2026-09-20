import Link from "next/link";

import TourClassForm from "../TourClassForm";

export default function NewTourClassPage() {
  return (
    <main className="space-y-6">
      <div>
        <Link
          href="/admin/catalogs/tour-classes"
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          ← Back to Tour Classes
        </Link>
      </div>

      <TourClassForm />
    </main>
  );
}
