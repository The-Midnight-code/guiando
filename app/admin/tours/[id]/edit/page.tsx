import Link from "next/link";
import { notFound } from "next/navigation";

import { getTourTypes, getTourClasses } from "@/lib/queries/catalogs";
import { getTourById } from "@/lib/queries/tours";
import { getTourPhotos } from "@/lib/queries/tourPhotos";

import TourForm from "../../TourForm";
import TourPhotosForm from "../../TourPhotosForm";

interface EditTourPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditTourPage({ params }: EditTourPageProps) {
  const { id } = await params;

  const [tour, tourTypes, tourClasses, photos] = await Promise.all([
    getTourById(id),
    getTourTypes(),
    getTourClasses(),
    getTourPhotos(id),
  ]);

  if (!tour) {
    notFound();
  }

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

      <div className="mx-auto max-w-5xl space-y-6">
        <TourForm
          tourTypes={tourTypes}
          tourClasses={tourClasses}
          initialData={{
            id: tour.id,
            productId: tour.productId,
            name: tour.name,
            description: tour.description,
            duration: tour.duration,
            price: tour.price,
            tourTypeId: tour.tourTypeId,
            tourClassId: tour.tourClassId,
            active: tour.active,
          }}
        />

        <TourPhotosForm tourId={tour.id} initialPhotos={photos} />
      </div>
    </main>
  );
}
