import Link from "next/link";

import { getTours } from "@/lib/queries/tours";

import DeleteTourButton from "./DeleteTourButton";

export default async function ToursPage() {
  const tours = await getTours();

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Tours</h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your tour products.
          </p>
        </div>

        <Link
          href="/admin/tours/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white"
        >
          Create Tour
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Name
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Product ID
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Type
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Class
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Duration
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Price
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Status
                </th>

                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white">
              {tours.map((tour) => (
                <tr key={tour.id}>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {tour.name}
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {tour.productId ?? "-"}
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {tour.tourType?.name}
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {tour.tourClass?.name ?? "-"}
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {tour.duration ? `${tour.duration} min` : "-"}
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {tour.price ? `$${tour.price}` : "-"}
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <span
                      className={
                        tour.active ? "text-green-600" : "text-gray-400"
                      }
                    >
                      {tour.active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/admin/tours/${tour.id}/edit`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </Link>

                      <DeleteTourButton id={tour.id} name={tour.name} />
                    </div>
                  </td>
                </tr>
              ))}

              {tours.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-10 text-center text-sm text-gray-500"
                  >
                    No tours found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
