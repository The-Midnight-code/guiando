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
    <main className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{tour.name}</h1>

          <p className="mt-1 text-sm text-muted-foreground">Tour details</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/tours"
            className="rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-card-secondary"
          >
            Back
          </Link>

          <Link
            href={`/admin/tours/${tour.id}/edit`}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
          >
            Edit
          </Link>

          <DeleteTourButton id={tour.id} name={tour.name} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border bg-card">
          <div className="border-b px-6 py-5">
            <h2 className="font-semibold">Tour Information</h2>
          </div>

          <dl className="space-y-5 p-6">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Product ID
              </dt>
              <dd className="mt-1 text-sm font-medium">
                {tour.productId ?? "—"}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Description
              </dt>
              <dd className="mt-1 text-sm leading-6">
                {tour.description ?? "—"}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Tour Type
              </dt>
              <dd className="mt-1 text-sm font-medium">
                {tour.tourType?.name ?? "—"}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Tour Class
              </dt>
              <dd className="mt-1 text-sm font-medium">
                {tour.tourClass?.name ?? "—"}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-xl border bg-card">
          <div className="border-b px-6 py-5">
            <h2 className="font-semibold">Pricing & Duration</h2>
          </div>

          <dl className="space-y-5 p-6">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Duration
              </dt>
              <dd className="mt-1 text-sm font-medium">
                {tour.duration != null ? `${tour.duration} minutes` : "—"}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Price
              </dt>
              <dd className="mt-1 text-sm font-medium">
                {tour.price != null ? `$${tour.price}` : "—"}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Status
              </dt>

              <dd className="mt-1">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                    tour.active
                      ? "bg-green-500/15 text-success"
                      : "bg-card-secondary text-muted-foreground"
                  }`}
                >
                  {tour.active ? "Active" : "Inactive"}
                </span>
              </dd>
            </div>
          </dl>
        </section>
      </div>

      <TourPhotosForm tourId={tour.id} initialPhotos={tour.photos} />
    </main>
  );
}
