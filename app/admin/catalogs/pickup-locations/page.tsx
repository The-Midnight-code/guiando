import Link from "next/link";

import { getPickupLocations } from "@/lib/queries/pickupLocations";

import TogglePickupLocationButton from "./TogglePickupLocationButton";

export default async function PickupLocationsPage() {
  const pickupLocations = await getPickupLocations();

  return (
    <main className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Pickup Locations</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage the predefined pickup locations for tours.
          </p>
        </div>

        <Link
          href="/admin/catalogs/pickup-locations/new"
          className="w-full rounded-md bg-primary px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-primary-hover sm:w-auto"
        >
          New Pickup Location
        </Link>
      </div>

      <div className="rounded-xl border bg-card">
        {pickupLocations.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-muted-foreground">
            No pickup locations found.
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="min-w-full">
                <thead className="border-b bg-card-secondary">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Name
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Address
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Instructions
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Coordinates
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Status
                    </th>

                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {pickupLocations.map((location) => (
                    <tr
                      key={location.id}
                      className="transition-colors hover:bg-card-secondary"
                    >
                      <td className="px-4 py-4 text-sm font-medium">
                        {location.name}
                      </td>

                      <td className="px-4 py-4 text-sm text-muted-foreground">
                        {location.address}
                      </td>

                      <td className="max-w-xs px-4 py-4 text-sm text-muted-foreground">
                        {location.instructions || "—"}
                      </td>

                      <td className="px-4 py-4 text-sm text-muted-foreground">
                        {location.latitude && location.longitude
                          ? `${location.latitude}, ${location.longitude}`
                          : "—"}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            location.active
                              ? "bg-green-500/15 text-success"
                              : "bg-card-secondary text-muted-foreground"
                          }`}
                        >
                          {location.active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-4">
                          <Link
                            href={`/admin/catalogs/pickup-locations/${location.id}/edit`}
                            className="text-sm font-medium text-primary transition-colors hover:text-primary-hover"
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
                </tbody>
              </table>
            </div>

            {/* Mobile / Tablet */}
            <div className="divide-y lg:hidden">
              {pickupLocations.map((location) => (
                <div
                  key={location.id}
                  className="space-y-5 p-5 transition-colors hover:bg-card-secondary"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h2 className="font-medium">{location.name}</h2>

                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {location.address}
                      </p>
                    </div>

                    <span
                      className={`w-fit shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                        location.active
                          ? "bg-green-500/15 text-success"
                          : "bg-card-secondary text-muted-foreground"
                      }`}
                    >
                      {location.active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Instructions
                      </p>

                      <p className="mt-1 leading-6">
                        {location.instructions || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Coordinates
                      </p>

                      <p className="mt-1">
                        {location.latitude && location.longitude
                          ? `${location.latitude}, ${location.longitude}`
                          : "—"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-end">
                    <Link
                      href={`/admin/catalogs/pickup-locations/${location.id}/edit`}
                      className="w-full rounded-md border px-4 py-2 text-center text-sm font-medium transition-colors hover:bg-card sm:w-auto"
                    >
                      Edit
                    </Link>

                    <TogglePickupLocationButton
                      id={location.id}
                      name={location.name}
                      active={location.active}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
