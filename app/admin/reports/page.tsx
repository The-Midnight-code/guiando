import { getFinancialReportRows } from "@/lib/queries/financials";
import ReportsFilters from "@/components/reports/ReporstFilters";
import { getActiveTourTypes } from "@/lib/queries/tourTypes";
import { getActiveTours } from "@/lib/queries/tours";
import { getScheduledTourStatuses } from "@/lib/queries/scheduledTours";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{
    startDate?: string;
    endDate?: string;
    tourTypeId?: string;
    tourId?: string;
    status?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1"));

  const today = new Date();

  const defaultStartDate = `${today.getFullYear()}-01-01`;
  const defaultEndDate = `${today.getFullYear()}-12-31`;

  const startDate = params.startDate ?? defaultStartDate;
  const endDate = params.endDate ?? defaultEndDate;

  const tourTypeId = params.tourTypeId;
  const tourId = params.tourId;
  const status = params.status;

  const [report, tourTypes, tours, statuses] = await Promise.all([
    getFinancialReportRows(
      {
        startDate,
        endDate,
        tourTypeId,
        tourId,
        status,
      },
      page,
      20,
    ),
    getActiveTourTypes(),
    getActiveTours(tourTypeId),
    getScheduledTourStatuses(),
  ]);

  const { rows, total, totalPages, summary } = report;

  const { totalPayments, totalCost, totalRevenue, totalPeople } = summary;

  const revenueMargin =
    totalPayments > 0 ? (totalRevenue / totalPayments) * 100 : 0;

  const formatUsd = (value: string | null) => {
    if (value == null) return "—";

    return `$${Number(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <main className="space-y-6 p-8">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Reports & Statistics</h1>
            <p className="mt-1 text-sm text-gray-500">
              Financial overview based on the selected filters.
            </p>
          </div>

          <a
            href={`/api/reports/financials/export?${new URLSearchParams({
              startDate,
              endDate,
              ...(tourTypeId && { tourTypeId }),
              ...(tourId && { tourId }),
              ...(status && { status }),
            }).toString()}`}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Export CSV
          </a>
        </div>
      </div>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border bg-white p-5">
          <p className="text-sm text-gray-500">Total Payments</p>
          <p className="mt-2 text-2xl font-bold">${totalPayments.toFixed(2)}</p>
          <p className="mt-1 text-xs text-gray-400">USD</p>
        </div>

        <div className="rounded-lg border bg-white p-5">
          <p className="text-sm text-gray-500">Total Cost</p>
          <p className="mt-2 text-2xl font-bold">${totalCost.toFixed(2)}</p>
          <p className="mt-1 text-xs text-gray-400">USD</p>
        </div>

        <div className="rounded-lg border bg-white p-5">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="mt-2 text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
          <p className="mt-1 text-xs text-gray-400">USD</p>
        </div>

        <div className="rounded-lg border bg-white p-5">
          <p className="text-sm text-gray-500">Revenue Margin</p>
          <p className="mt-2 text-2xl font-bold">{revenueMargin.toFixed(2)}%</p>
          <p className="mt-1 text-xs text-gray-400">Revenue / Total Payments</p>
        </div>
      </section>
      <section className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Filters</h2>

        <ReportsFilters
          tourTypes={tourTypes}
          tours={tours}
          statuses={statuses}
        />
      </section>

      <section className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Financial Report</h2>

        {rows.length === 0 ? (
          <p className="text-sm text-gray-500">
            No financial records found for this period.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Date
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Tour
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">
                    People
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Status
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">
                    Payment (USD)
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">
                    Cost (USD)
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">
                    Revenue (USD)
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">
                    Margin
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {rows.map((row) => (
                  <tr key={row.scheduledTourId}>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {row.tourDate}
                    </td>

                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {row.tourName}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-600">
                      {row.numberOfPeople ?? "—"}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-600">
                      {row.status}
                    </td>

                    <td className="px-4 py-3 text-right text-sm text-gray-600">
                      {formatUsd(row.totalPaymentUsd)}
                    </td>

                    <td className="px-4 py-3 text-right text-sm text-gray-600">
                      {formatUsd(row.totalCostUsd)}
                    </td>

                    <td className="px-4 py-3 text-right text-sm text-gray-600">
                      {formatUsd(row.totalRevenueUsd)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-600">
                      {row.revenuePercentage != null
                        ? `${Number(row.revenuePercentage).toFixed(2)}%`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t bg-gray-50">
                <tr>
                  <td
                    colSpan={2}
                    className="px-4 py-3 text-sm font-semibold text-gray-900"
                  >
                    Total
                  </td>

                  <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                    {totalPeople}
                  </td>

                  <td className="px-4 py-3" />

                  <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                    {formatUsd(totalPayments.toFixed(2))}
                  </td>

                  <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                    {formatUsd(totalCost.toFixed(2))}
                  </td>

                  <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                    {formatUsd(totalRevenue.toFixed(2))}
                  </td>

                  <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                    {revenueMargin.toFixed(2)}%
                  </td>
                </tr>
              </tfoot>
            </table>
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between border-t pt-4">
                <p className="text-sm text-gray-500">
                  Page {page} of {totalPages} ({total} records)
                </p>

                <div className="flex gap-2">
                  {totalPages > 1 && (
                    <div className="mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-gray-500">
                        Showing{" "}
                        <span className="font-medium text-gray-700">
                          {(page - 1) * 20 + 1}
                        </span>{" "}
                        –{" "}
                        <span className="font-medium text-gray-700">
                          {Math.min(page * 20, total)}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium text-gray-700">
                          {total}
                        </span>{" "}
                        records
                      </p>

                      <div className="flex items-center gap-1">
                        {page > 1 ? (
                          <a
                            href={`?${new URLSearchParams({
                              startDate,
                              endDate,
                              ...(tourTypeId && { tourTypeId }),
                              ...(tourId && { tourId }),
                              ...(status && { status }),
                              page: String(page - 1),
                            }).toString()}`}
                            className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
                          >
                            Previous
                          </a>
                        ) : (
                          <span className="cursor-not-allowed rounded-md border px-3 py-2 text-sm text-gray-300">
                            Previous
                          </span>
                        )}

                        {Array.from({ length: totalPages }, (_, index) => {
                          const pageNumber = index + 1;

                          return (
                            <a
                              key={pageNumber}
                              href={`?${new URLSearchParams({
                                startDate,
                                endDate,
                                ...(tourTypeId && { tourTypeId }),
                                ...(tourId && { tourId }),
                                ...(status && { status }),
                                page: String(pageNumber),
                              }).toString()}`}
                              className={`rounded-md border px-3 py-2 text-sm ${
                                pageNumber === page
                                  ? "bg-gray-900 text-white"
                                  : "hover:bg-gray-50"
                              }`}
                            >
                              {pageNumber}
                            </a>
                          );
                        })}

                        {page < totalPages ? (
                          <a
                            href={`?${new URLSearchParams({
                              startDate,
                              endDate,
                              ...(tourTypeId && { tourTypeId }),
                              ...(tourId && { tourId }),
                              ...(status && { status }),
                              page: String(page + 1),
                            }).toString()}`}
                            className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
                          >
                            Next
                          </a>
                        ) : (
                          <span className="cursor-not-allowed rounded-md border px-3 py-2 text-sm text-gray-300">
                            Next
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
