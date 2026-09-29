import Link from "next/link";
import { notFound } from "next/navigation";

import { getTourClassById } from "@/lib/queries/tourClasses";

import TourClassForm from "../../TourClassForm";

interface EditTourClassPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditTourClassPage({
  params,
}: EditTourClassPageProps) {
  const { id } = await params;

  const tourClass = await getTourClassById(id);

  if (!tourClass) {
    notFound();
  }

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
        <TourClassForm
          initialData={{
            id: tourClass.id,
            name: tourClass.name,
            description: tourClass.description,
            active: tourClass.active,
          }}
        />
      </div>
    </main>
  );
}
