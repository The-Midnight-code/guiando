import Link from "next/link";
import DeleteTourButton from "./DeleteTourButton";

interface Tour {
  id: string;
  productId: string | null;
  name: string;
  description: string | null;
  duration: number | null;
  price: string | null;
  active: boolean;
  tourType: {
    name: string;
  } | null;
  tourClass: {
    name: string;
  } | null;
}

interface ToursTableProps {
  tours: Tour[];
}

export default function ToursTable({ tours }: ToursTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border bg-white">
      <table className="min-w-full divide-y">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
              Product ID
            </th>

            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
              Tour
            </th>

            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
              Type
            </th>

            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
              Class
            </th>

            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
              Duration
            </th>

            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
              Price
            </th>

            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
              Status
            </th>

            <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="divide-y">
          {tours.map((tour) => (
            <tr key={tour.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm text-gray-600">
                {tour.productId ?? "—"}
              </td>

              <td className="px-4 py-3">
                <div className="font-medium text-gray-900">{tour.name}</div>

                {tour.description && (
                  <div className="max-w-xs truncate text-sm text-gray-500">
                    {tour.description}
                  </div>
                )}
              </td>

              <td className="px-4 py-3 text-sm text-gray-600">
                {tour.tourType?.name ?? "—"}
              </td>

              <td className="px-4 py-3 text-sm text-gray-600">
                {tour.tourClass?.name ?? "—"}
              </td>

              <td className="px-4 py-3 text-sm text-gray-600">
                {tour.duration != null ? `${tour.duration} min` : "—"}
              </td>

              <td className="px-4 py-3 text-sm text-gray-600">
                {tour.price != null ? `$${tour.price}` : "—"}
              </td>

              <td className="px-4 py-3">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                    tour.active
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {tour.active ? "Active" : "Inactive"}
                </span>
              </td>

              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-3">
                  <Link
                    href={`/admin/tours/${tour.id}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    View
                  </Link>

                  <Link
                    href={`/admin/tours/${tour.id}/edit`}
                    className="text-sm font-medium text-gray-600 hover:text-gray-900"
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
                className="px-4 py-8 text-center text-sm text-gray-500"
              >
                No tours found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
