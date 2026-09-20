import Link from "next/link";

import { getAffiliates } from "@/lib/queries/affiliates";

import ToggleAffiliateButton from "./ToggleAffiliateButton";

export default async function AffiliatesPage() {
  const affiliates = await getAffiliates();

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Affiliates</h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage the affiliates associated with tours.
          </p>
        </div>

        <Link
          href="/admin/catalogs/affiliates/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + New Affiliate
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
            {affiliates.map((affiliate) => (
              <tr key={affiliate.id}>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  {affiliate.name}
                </td>

                <td className="px-6 py-4 text-sm text-gray-500">
                  {affiliate.description || "—"}
                </td>

                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      affiliate.active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {affiliate.active ? "Active" : "Inactive"}
                  </span>
                </td>

                <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                  <div className="flex justify-end gap-4">
                    <Link
                      href={`/admin/catalogs/affiliates/${affiliate.id}/edit`}
                      className="text-blue-600 hover:text-blue-800"
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

            {affiliates.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-8 text-center text-sm text-gray-500"
                >
                  No affiliates found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
