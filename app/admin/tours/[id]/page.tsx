import Link from "next/link";
import { notFound } from "next/navigation";

import { getTourById } from "@/lib/queries/tours";

import DeleteTourButton from "../DeleteTourButton";

import TourPhotosForm from "../TourPhotosForm";

interface TourDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TourDetailsPage({
  params,
}: TourDetailsPageProps) {
  const { id } = await params;

  const tour = await getTourById(id);

  if (!tour) {
    notFound();
  }

  return (
    <main className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{tour.name}</h1>

          <p className="mt-1 text-sm text-gray-500">Tour details</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/tours"
            className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Back
          </Link>

          <Link
            href={`/admin/tours/${tour.id}/edit`}
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Edit
          </Link>

          <DeleteTourButton id={tour.id} name={tour.name} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Tour Information</h2>

          <dl className="space-y-4">
            <div>
              <dt className="text-sm text-gray-500">Product ID</dt>
              <dd className="font-medium">{tour.productId ?? "—"}</dd>
            </div>

            <div>
              <dt className="text-sm text-gray-500">Description</dt>
              <dd className="font-medium">{tour.description ?? "—"}</dd>
            </div>

            <div>
              <dt className="text-sm text-gray-500">Tour Type</dt>
              <dd className="font-medium">{tour.tourType?.name ?? "—"}</dd>
            </div>

            <div>
              <dt className="text-sm text-gray-500">Tour Class</dt>
              <dd className="font-medium">{tour.tourClass?.name ?? "—"}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Pricing & Duration</h2>

          <dl className="space-y-4">
            <div>
              <dt className="text-sm text-gray-500">Duration</dt>
              <dd className="font-medium">
                {tour.duration != null ? `${tour.duration} minutes` : "—"}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-gray-500">Price</dt>
              <dd className="font-medium">
                {tour.price != null ? `$${tour.price}` : "—"}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-gray-500">Status</dt>
              <dd>
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                    tour.active
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {tour.active ? "Active" : "Inactive"}
                </span>
              </dd>
            </div>
          </dl>
        </section>
      </div>

      <div className="mt-6">
        <TourPhotosForm tourId={tour.id} initialPhotos={tour.photos} />
      </div>
    </main>
  );
}
