import { getTours } from "@/lib/queries/tours";

export default async function TestToursPage() {
  const tours = await getTours();

  return (
    <main className="p-8">
      <h1 className="mb-6 text-2xl font-bold">Tours</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tours.map((tour) => (
          <article key={tour.id} className="rounded-lg border p-5">
            <h2 className="text-xl font-semibold">{tour.name}</h2>

            <p className="mt-2 text-sm text-gray-600">
              {tour.description ?? "No description"}
            </p>

            <div className="mt-4 space-y-1 text-sm">
              <p>
                <strong>Product ID:</strong> {tour.productId ?? "N/A"}
              </p>

              <p>
                <strong>Type:</strong> {tour.tourType?.name ?? "N/A"}
              </p>

              <p>
                <strong>Class:</strong> {tour.tourClass?.name ?? "N/A"}
              </p>

              <p>
                <strong>Duration:</strong>{" "}
                {tour.duration ? `${tour.duration} minutes` : "N/A"}
              </p>

              <p>
                <strong>Price:</strong>{" "}
                {tour.price ? `$${tour.price} USD` : "N/A"}
              </p>

              <p>
                <strong>Status:</strong> {tour.active ? "Active" : "Inactive"}
              </p>
            </div>

            <div className="mt-4">
              <strong className="text-sm">Photos:</strong>

              {tour.photos.length === 0 ? (
                <p className="text-sm text-gray-500">No photos</p>
              ) : (
                <ul className="mt-1 list-disc pl-5 text-sm">
                  {tour.photos.map((photo) => (
                    <li key={photo.id}>{photo.url}</li>
                  ))}
                </ul>
              )}
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
