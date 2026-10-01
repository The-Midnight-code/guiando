import { getFinancialReportRows } from "@/lib/queries/financials";
import { getScheduledTourStatuses } from "@/lib/queries/scheduledTours";
import { getActiveTourTypes } from "@/lib/queries/tourTypes";
import { getActiveTours } from "@/lib/queries/tours";

import ReportsFilters from "@/components/reports/ReporstFilters";

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
    if (value == null) {
      return "—";
    }

    return `$${Number(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const filterParams = {
    startDate,
    endDate,
    ...(tourTypeId && { tourTypeId }),
    ...(tourId && { tourId }),
    ...(status && { status }),
  };

  return (
    <main className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Reports & Statistics</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Financial overview based on the selected filters.
          </p>
        </div>

        <a
          href={`/api/reports/financials/export?${new URLSearchParams(
            filterParams,
          ).toString()}`}
          className="w-full rounded-md bg-primary px-4 py-2 text-center text-sm font-medium text-white hover:bg-primary-hover sm:w-auto"
        >
          Export CSV
        </a>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">Total Payments</p>

          <p className="mt-2 text-2xl font-semibold">
            ${totalPayments.toFixed(2)}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">USD</p>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">Total Cost</p>

          <p className="mt-2 text-2xl font-semibold">${totalCost.toFixed(2)}</p>

          <p className="mt-1 text-xs text-muted-foreground">USD</p>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">Total Revenue</p>

          <p className="mt-2 text-2xl font-semibold text-success">
            ${totalRevenue.toFixed(2)}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">USD</p>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">Revenue Margin</p>

          <p className="mt-2 text-2xl font-semibold text-primary">
            {revenueMargin.toFixed(2)}%
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Revenue / Total Payments
          </p>
        </div>
      </section>

      <section className="rounded-xl border bg-card p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold">Filters</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Filter the financial report by date, tour, type, or status.
          </p>
        </div>

        <ReportsFilters
          tourTypes={tourTypes}
          tours={tours}
          statuses={statuses}
        />
      </section>

      <section className="rounded-xl border bg-card p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold">Financial Report</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Detailed financial results for the selected period.
          </p>
        </div>

        {rows.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm font-medium text-foreground">
              No financial records found
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting the selected filters or date range.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y">
              <thead className="bg-card-secondary">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                    Date
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                    Tour
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-muted-foreground">
                    People
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                    Status
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-muted-foreground">
                    Payment (USD)
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-muted-foreground">
                    Cost (USD)
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-muted-foreground">
                    Revenue (USD)
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-muted-foreground">
                    Margin
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {rows.map((row) => (
                  <tr key={row.scheduledTourId}>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {row.tourDate}
                    </td>

                    <td className="px-4 py-3 text-sm font-medium text-foreground">
                      {row.tourName}
                    </td>

                    <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                      {row.numberOfPeople ?? "—"}
                    </td>

                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {row.status}
                    </td>

                    <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                      {formatUsd(row.totalPaymentUsd)}
                    </td>

                    <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                      {formatUsd(row.totalCostUsd)}
                    </td>

                    <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                      {formatUsd(row.totalRevenueUsd)}
                    </td>

                    <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                      {row.revenuePercentage != null
                        ? `${Number(row.revenuePercentage).toFixed(2)}%`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>

              <tfoot className="border-t bg-card-secondary">
                <tr>
                  <td
                    colSpan={2}
                    className="px-4 py-3 text-sm font-semibold text-foreground"
                  >
                    Total
                  </td>

                  <td className="px-4 py-3 text-right text-sm font-semibold text-foreground">
                    {totalPeople}
                  </td>

                  <td className="px-4 py-3" />

                  <td className="px-4 py-3 text-right text-sm font-semibold text-foreground">
                    {formatUsd(totalPayments.toFixed(2))}
                  </td>

                  <td className="px-4 py-3 text-right text-sm font-semibold text-foreground">
                    {formatUsd(totalCost.toFixed(2))}
                  </td>

                  <td className="px-4 py-3 text-right text-sm font-semibold text-foreground">
                    {formatUsd(totalRevenue.toFixed(2))}
                  </td>

                  <td className="px-4 py-3 text-right text-sm font-semibold text-foreground">
                    {revenueMargin.toFixed(2)}%
                  </td>
                </tr>
              </tfoot>
            </table>

            {totalPages > 1 && (
              <div className="mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {(page - 1) * 20 + 1}-{Math.min(page * 20, total)} of{" "}
                  {total} records
                </p>

                <div className="flex items-center gap-1">
                  {page > 1 && (
                    <a
                      href={`?${new URLSearchParams({
                        ...filterParams,
                        page: String(page - 1),
                      }).toString()}`}
                      className="rounded-md border px-3 py-2 text-sm font-medium text-foreground hover:bg-card-secondary"
                    >
                      Previous
                    </a>
                  )}

                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1,
                  ).map((pageNumber) => (
                    <a
                      key={pageNumber}
                      href={`?${new URLSearchParams({
                        ...filterParams,
                        page: String(pageNumber),
                      }).toString()}`}
                      className={`rounded-md border px-3 py-2 text-sm font-medium ${
                        pageNumber === page
                          ? "border-primary bg-primary text-white"
                          : "hover:bg-card-secondary"
                      }`}
                    >
                      {pageNumber}
                    </a>
                  ))}

                  {page < totalPages && (
                    <a
                      href={`?${new URLSearchParams({
                        ...filterParams,
                        page: String(page + 1),
                      }).toString()}`}
                      className="rounded-md border px-3 py-2 text-sm font-medium text-foreground hover:bg-card-secondary"
                    >
                      Next
                    </a>
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
