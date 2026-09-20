import Link from "next/link";
import { notFound } from "next/navigation";

import { getTourTypeById } from "@/lib/queries/tourTypes";

import TourTypeForm from "../../TourTypeForm";

interface EditTourTypePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditTourTypePage({
  params,
}: EditTourTypePageProps) {
  const { id } = await params;

  const tourType = await getTourTypeById(id);

  if (!tourType) {
    notFound();
  }

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

      <TourTypeForm
        initialData={{
          id: tourType.id,
          name: tourType.name,
          description: tourType.description,
          active: tourType.active,
        }}
      />
    </main>
  );
}
