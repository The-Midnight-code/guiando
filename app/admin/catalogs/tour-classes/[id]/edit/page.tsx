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
    <main className="space-y-6">
      <div>
        <Link
          href="/admin/catalogs/tour-classes"
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          ← Back to Tour Classes
        </Link>
      </div>

      <TourClassForm
        initialData={{
          id: tourClass.id,
          name: tourClass.name,
          description: tourClass.description,
          active: tourClass.active,
        }}
      />
    </main>
  );
}
