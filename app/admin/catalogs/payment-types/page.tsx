import Link from "next/link";

import { getPaymentTypes } from "@/lib/queries/paymentTypes";

import TogglePaymentTypeButton from "./TogglePaymentTypeButton";

export default async function PaymentTypesPage() {
  const paymentTypes = await getPaymentTypes();

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Payment Types
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage the payment methods available for tours.
          </p>
        </div>

        <Link
          href="/admin/catalogs/payment-types/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + New Payment Type
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
            {paymentTypes.map((paymentType) => (
              <tr key={paymentType.id}>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  {paymentType.name}
                </td>

                <td className="px-6 py-4 text-sm text-gray-500">
                  {paymentType.description || "—"}
                </td>

                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      paymentType.active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {paymentType.active ? "Active" : "Inactive"}
                  </span>
                </td>

                <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                  <div className="flex justify-end gap-4">
                    <Link
                      href={`/admin/catalogs/payment-types/${paymentType.id}/edit`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </Link>

                    <TogglePaymentTypeButton
                      id={paymentType.id}
                      name={paymentType.name}
                      active={paymentType.active}
                    />
                  </div>
                </td>
              </tr>
            ))}

            {paymentTypes.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-8 text-center text-sm text-gray-500"
                >
                  No payment types found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
