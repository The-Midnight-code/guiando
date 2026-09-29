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
        <TourTypeForm
          initialData={{
            id: tourType.id,
            name: tourType.name,
            description: tourType.description,
            active: tourType.active,
          }}
        />
      </div>
    </main>
  );
}
