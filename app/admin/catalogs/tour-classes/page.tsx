import Link from "next/link";

import { getTourClasses } from "@/lib/queries/tourClasses";

import ToggleTourClassButton from "./ToggleTourClassButton";

export default async function TourClassesPage() {
  const tourClasses = await getTourClasses();

  return (
    <main className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Tour Classes</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage the classes of tours available in the system.
          </p>
        </div>

        <Link
          href="/admin/catalogs/tour-classes/new"
          className="w-full rounded-md bg-primary px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-primary-hover sm:w-auto"
        >
          New Tour Class
        </Link>
      </div>

      <div className="rounded-xl border bg-card">
        {tourClasses.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-muted-foreground">
            No tour classes found.
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
                  {tourClasses.map((tourClass) => (
                    <tr
                      key={tourClass.id}
                      className="transition-colors hover:bg-card-secondary"
                    >
                      <td className="px-4 py-4 text-sm font-medium">
                        {tourClass.name}
                      </td>

                      <td className="px-4 py-4 text-sm text-muted-foreground">
                        {tourClass.description || "—"}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            tourClass.active
                              ? "bg-green-500/15 text-success"
                              : "bg-card-secondary text-muted-foreground"
                          }`}
                        >
                          {tourClass.active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-4">
                          <Link
                            href={`/admin/catalogs/tour-classes/${tourClass.id}/edit`}
                            className="text-sm font-medium text-primary transition-colors hover:text-primary-hover"
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
                </tbody>
              </table>
            </div>

            {/* Mobile / Tablet */}
            <div className="divide-y lg:hidden">
              {tourClasses.map((tourClass) => (
                <div
                  key={tourClass.id}
                  className="space-y-5 p-5 transition-colors hover:bg-card-secondary"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h2 className="font-medium">{tourClass.name}</h2>

                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {tourClass.description || "No description"}
                      </p>
                    </div>

                    <span
                      className={`w-fit shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                        tourClass.active
                          ? "bg-green-500/15 text-success"
                          : "bg-card-secondary text-muted-foreground"
                      }`}
                    >
                      {tourClass.active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-end">
                    <Link
                      href={`/admin/catalogs/tour-classes/${tourClass.id}/edit`}
                      className="w-full rounded-md border px-4 py-2 text-center text-sm font-medium transition-colors hover:bg-card sm:w-auto"
                    >
                      Edit
                    </Link>

                    <ToggleTourClassButton
                      id={tourClass.id}
                      name={tourClass.name}
                      active={tourClass.active}
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
