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
    <div className="overflow-hidden rounded-lg  bg-[#1E293B]">
      <table className="min-w-full divide-y">
        <thead className="bg-[#3B82F6]">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase">
              Product ID
            </th>

            <th className="px-4 py-3 text-left text-xs font-medium uppercase">
              Tour
            </th>

            <th className="px-4 py-3 text-left text-xs font-medium uppercase">
              Type
            </th>

            <th className="px-4 py-3 text-left text-xs font-medium uppercase">
              Class
            </th>

            <th className="px-4 py-3 text-left text-xs font-medium uppercase">
              Duration
            </th>

            <th className="px-4 py-3 text-left text-xs font-medium uppercase">
              Price
            </th>

            <th className="px-4 py-3 text-left text-xs font-medium uppercase">
              Status
            </th>

            <th className="px-4 py-3 text-right text-xs font-medium uppercase">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {tours.map((tour) => (
            <tr key={tour.id} className="hover:bg-[#2563EB]">
              <td className="px-4 py-3 text-sm">{tour.productId ?? "—"}</td>

              <td className="px-4 py-3">
                <div className="font-medium">{tour.name}</div>

                {tour.description && (
                  <div className="max-w-xs truncate text-sm text-[#94A3B8]">
                    {tour.description}
                  </div>
                )}
              </td>

              <td className="px-4 py-3 text-sm">
                {tour.tourType?.name ?? "—"}
              </td>

              <td className="px-4 py-3 text-sm">
                {tour.tourClass?.name ?? "—"}
              </td>

              <td className="px-4 py-3 text-sm">
                {tour.duration != null ? `${tour.duration} min` : "—"}
              </td>

              <td className="px-4 py-3 text-sm">
                {tour.price != null ? `$${tour.price}` : "—"}
              </td>

              <td className="px-4 py-3">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                    tour.active
                      ? "bg-[#10B981] text-green-800"
                      : "bg-[#64748B] text-gray-800"
                  }`}
                >
                  {tour.active ? "Active" : "Inactive"}
                </span>
              </td>

              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-3">
                  <Link
                    href={`/admin/tours/${tour.id}`}
                    className="text-sm font-medium text-[#38BDF8]"
                  >
                    View
                  </Link>

                  <Link
                    href={`/admin/tours/${tour.id}/edit`}
                    className="text-sm font-medium text-[#F59E0B]"
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
