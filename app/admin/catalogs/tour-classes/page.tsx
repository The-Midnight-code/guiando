import Link from "next/link";

import { getTourClasses } from "@/lib/queries/tourClasses";

import ToggleTourClassButton from "./ToggleTourClassButton";

export default async function TourClassesPage() {
  const tourClasses = await getTourClasses();

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Tour Classes</h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage the classes of tours available in the system.
          </p>
        </div>

        <Link
          href="/admin/catalogs/tour-classes/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + New Tour Class
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Name
              </th>

              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Description
              </th>

              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>

              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 bg-white">
            {tourClasses.map((tourClass) => (
              <tr key={tourClass.id}>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  {tourClass.name}
                </td>

                <td className="px-6 py-4 text-sm text-gray-500">
                  {tourClass.description || "—"}
                </td>

                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      tourClass.active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {tourClass.active ? "Active" : "Inactive"}
                  </span>
                </td>

                <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                  <div className="flex justify-end gap-4">
                    <Link
                      href={`/admin/catalogs/tour-classes/${tourClass.id}/edit`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </Link>

                    <ToggleTourClassButton
                      id={tourClass.id}
                      name={tourClass.name}
                      active={tourClass.active}
                    />
                  </div>
                </td>
              </tr>
            ))}

            {tourClasses.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-8 text-center text-sm text-gray-500"
                >
                  No tour classes found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
