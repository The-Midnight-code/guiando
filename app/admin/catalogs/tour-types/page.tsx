import Link from "next/link";

import { getTourTypes } from "@/lib/queries/tourTypes";

import ToggleTourTypeButton from "./ToggleTourTypeButton";

export default async function TourTypesPage() {
  const tourTypes = await getTourTypes();

  return (
    <main className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Tour Types</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage the types of tours available in the system.
          </p>
        </div>

        <Link
          href="/admin/catalogs/tour-types/new"
          className="w-full rounded-md bg-primary px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-primary-hover sm:w-auto"
        >
          New Tour Type
        </Link>
      </div>

      <div className="rounded-xl border bg-card">
        {tourTypes.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-muted-foreground">
            No tour types found.
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
                      Description
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
                  {tourTypes.map((tourType) => (
                    <tr
                      key={tourType.id}
                      className="transition-colors hover:bg-card-secondary"
                    >
                      <td className="px-4 py-4 text-sm font-medium">
                        {tourType.name}
                      </td>

                      <td className="px-4 py-4 text-sm text-muted-foreground">
                        {tourType.description || "—"}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            tourType.active
                              ? "bg-green-500/15 text-success"
                              : "bg-card-secondary text-muted-foreground"
                          }`}
                        >
                          {tourType.active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-4">
                          <Link
                            href={`/admin/catalogs/tour-types/${tourType.id}/edit`}
                            className="text-sm font-medium text-primary transition-colors hover:text-primary-hover"
                          >
                            Edit
                          </Link>

                          <ToggleTourTypeButton
                            id={tourType.id}
                            name={tourType.name}
                            active={tourType.active}
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
              {tourTypes.map((tourType) => (
                <div
                  key={tourType.id}
                  className="space-y-5 p-5 transition-colors hover:bg-card-secondary"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h2 className="font-medium">{tourType.name}</h2>

                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {tourType.description || "No description"}
                      </p>
                    </div>

                    <span
                      className={`w-fit shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                        tourType.active
                          ? "bg-green-500/15 text-success"
                          : "bg-card-secondary text-muted-foreground"
                      }`}
                    >
                      {tourType.active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-end">
                    <Link
                      href={`/admin/catalogs/tour-types/${tourType.id}/edit`}
                      className="w-full rounded-md border px-4 py-2 text-center text-sm font-medium transition-colors hover:bg-card sm:w-auto"
                    >
                      Edit
                    </Link>

                    <ToggleTourTypeButton
                      id={tourType.id}
                      name={tourType.name}
                      active={tourType.active}
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
