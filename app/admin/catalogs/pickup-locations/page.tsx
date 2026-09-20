import Link from "next/link";

import { getPickupLocations } from "@/lib/queries/pickupLocations";

import TogglePickupLocationButton from "./TogglePickupLocationButton";

export default async function PickupLocationsPage() {
  const pickupLocations = await getPickupLocations();

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Pickup Locations
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage the predefined pickup locations for tours.
          </p>
        </div>

        <Link
          href="/admin/catalogs/pickup-locations/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + New Pickup Location
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
                Address
              </th>

              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Instructions
              </th>

              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Coordinates
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
            {pickupLocations.map((location) => (
              <tr key={location.id}>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  {location.name}
                </td>

                <td className="px-6 py-4 text-sm text-gray-500">
                  {location.address}
                </td>

                <td className="max-w-xs px-6 py-4 text-sm text-gray-500">
                  {location.instructions || "—"}
                </td>

                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {location.latitude && location.longitude
                    ? `${location.latitude}, ${location.longitude}`
                    : "—"}
                </td>

                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      location.active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {location.active ? "Active" : "Inactive"}
                  </span>
                </td>

                <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                  <div className="flex justify-end gap-4">
                    <Link
                      href={`/admin/catalogs/pickup-locations/${location.id}/edit`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </Link>

                    <TogglePickupLocationButton
                      id={location.id}
                      name={location.name}
                      active={location.active}
                    />
                  </div>
                </td>
              </tr>
            ))}

            {pickupLocations.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-8 text-center text-sm text-gray-500"
                >
                  No pickup locations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
