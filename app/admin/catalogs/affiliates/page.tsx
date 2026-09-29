import Link from "next/link";

import { getAffiliates } from "@/lib/queries/affiliates";

import ToggleAffiliateButton from "./ToggleAffiliateButton";

export default async function AffiliatesPage() {
  const affiliates = await getAffiliates();

  return (
    <main className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Affiliates</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage the affiliates associated with tours.
          </p>
        </div>

        <Link
          href="/admin/catalogs/affiliates/new"
          className="w-full rounded-md bg-primary px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-primary-hover sm:w-auto"
        >
          New Affiliate
        </Link>
      </div>

      <div className="rounded-xl border bg-card">
        {affiliates.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-muted-foreground">
            No affiliates found.
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
                  {affiliates.map((affiliate) => (
                    <tr
                      key={affiliate.id}
                      className="transition-colors hover:bg-card-secondary"
                    >
                      <td className="px-4 py-4 text-sm font-medium">
                        {affiliate.name}
                      </td>

                      <td className="px-4 py-4 text-sm text-muted-foreground">
                        {affiliate.description || "—"}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            affiliate.active
                              ? "bg-green-500/15 text-success"
                              : "bg-card-secondary text-muted-foreground"
                          }`}
                        >
                          {affiliate.active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-4">
                          <Link
                            href={`/admin/catalogs/affiliates/${affiliate.id}/edit`}
                            className="text-sm font-medium text-primary transition-colors hover:text-primary-hover"
                          >
                            Edit
                          </Link>

                          <ToggleAffiliateButton
                            id={affiliate.id}
                            name={affiliate.name}
                            active={affiliate.active}
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
              {affiliates.map((affiliate) => (
                <div
                  key={affiliate.id}
                  className="space-y-5 p-5 transition-colors hover:bg-card-secondary"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h2 className="font-medium">{affiliate.name}</h2>

                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {affiliate.description || "No description"}
                      </p>
                    </div>

                    <span
                      className={`w-fit shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                        affiliate.active
                          ? "bg-green-500/15 text-success"
                          : "bg-card-secondary text-muted-foreground"
                      }`}
                    >
                      {affiliate.active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-end">
                    <Link
                      href={`/admin/catalogs/affiliates/${affiliate.id}/edit`}
                      className="w-full rounded-md border px-4 py-2 text-center text-sm font-medium transition-colors hover:bg-card sm:w-auto"
                    >
                      Edit
                    </Link>

                    <ToggleAffiliateButton
                      id={affiliate.id}
                      name={affiliate.name}
                      active={affiliate.active}
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
