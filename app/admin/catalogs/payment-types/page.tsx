import Link from "next/link";

import { getPaymentTypes } from "@/lib/queries/paymentTypes";

import TogglePaymentTypeButton from "./TogglePaymentTypeButton";

export default async function PaymentTypesPage() {
  const paymentTypes = await getPaymentTypes();

  return (
    <main className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Payment Types</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage the payment methods available for tours.
          </p>
        </div>

        <Link
          href="/admin/catalogs/payment-types/new"
          className="w-full rounded-md bg-primary px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-primary-hover sm:w-auto"
        >
          New Payment Type
        </Link>
      </div>

      <div className="rounded-xl border bg-card">
        {paymentTypes.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-muted-foreground">
            No payment types found.
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
                  {paymentTypes.map((paymentType) => (
                    <tr
                      key={paymentType.id}
                      className="transition-colors hover:bg-card-secondary"
                    >
                      <td className="px-4 py-4 text-sm font-medium">
                        {paymentType.name}
                      </td>

                      <td className="px-4 py-4 text-sm text-muted-foreground">
                        {paymentType.description || "—"}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            paymentType.active
                              ? "bg-green-500/15 text-success"
                              : "bg-card-secondary text-muted-foreground"
                          }`}
                        >
                          {paymentType.active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-4">
                          <Link
                            href={`/admin/catalogs/payment-types/${paymentType.id}/edit`}
                            className="text-sm font-medium text-primary transition-colors hover:text-primary-hover"
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
                </tbody>
              </table>
            </div>

            {/* Mobile / Tablet */}
            <div className="divide-y lg:hidden">
              {paymentTypes.map((paymentType) => (
                <div
                  key={paymentType.id}
                  className="space-y-5 p-5 transition-colors hover:bg-card-secondary"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h2 className="font-medium">{paymentType.name}</h2>

                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {paymentType.description || "No description"}
                      </p>
                    </div>

                    <span
                      className={`w-fit shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                        paymentType.active
                          ? "bg-green-500/15 text-success"
                          : "bg-card-secondary text-muted-foreground"
                      }`}
                    >
                      {paymentType.active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-end">
                    <Link
                      href={`/admin/catalogs/payment-types/${paymentType.id}/edit`}
                      className="w-full rounded-md border px-4 py-2 text-center text-sm font-medium transition-colors hover:bg-card sm:w-auto"
                    >
                      Edit
                    </Link>

                    <TogglePaymentTypeButton
                      id={paymentType.id}
                      name={paymentType.name}
                      active={paymentType.active}
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
