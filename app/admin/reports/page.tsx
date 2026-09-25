import { getFinancialReportRows } from "@/db/schema/financials";
import ReportsFilters from "@/components/reports/ReporstFilters";
import { getActiveTourTypes } from "@/db/schema/tourTypes";
import { getActiveTours } from "@/db/schema/tours";
import { getScheduledTourStatuses } from "@/db/schema/scheduledTours";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{
    startDate?: string;
    endDate?: string;
    tourTypeId?: string;
    tourId?: string;
    status?: string;
  }>;
}) {
  const params = await searchParams;

  const today = new Date();

  const defaultStartDate = `${today.getFullYear()}-01-01`;
  const defaultEndDate = `${today.getFullYear()}-12-31`;

  const startDate = params.startDate ?? defaultStartDate;
  const endDate = params.endDate ?? defaultEndDate;

  const tourTypeId = params.tourTypeId;
  const tourId = params.tourId;
  const status = params.status;

  const [rows, tourTypes, tours, statuses] = await Promise.all([
    getFinancialReportRows({
      startDate,
      endDate,
      tourTypeId,
      tourId,
      status,
    }),
    getActiveTourTypes(),
    getActiveTours(tourTypeId),
    getScheduledTourStatuses(),
  ]);

  const totalPayments = rows.reduce(
    (sum, row) => sum + Number(row.totalPaymentUsd ?? 0),
    0,
  );

  const totalCost = rows.reduce(
    (sum, row) => sum + Number(row.totalCostUsd ?? 0),
    0,
  );

  const totalRevenue = rows.reduce(
    (sum, row) => sum + Number(row.totalRevenueUsd ?? 0),
    0,
  );

  const revenuePercentages = rows
    .map((row) => Number(row.revenuePercentage ?? 0))
    .filter((value) => !Number.isNaN(value));

  const averageRevenuePercentage =
    revenuePercentages.length > 0
      ? revenuePercentages.reduce((sum, value) => sum + value, 0) /
        revenuePercentages.length
      : 0;

  return (
    <main className="space-y-6 p-8">
      <div>
        <h1 className="text-2xl font-bold">Reports & Statistics</h1>

        <p className="mt-1 text-sm text-gray-500">
          Financial overview based on the selected filters.
        </p>
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
          <p className="text-sm text-gray-500">Average Revenue</p>
          <p className="mt-2 text-2xl font-bold">
            {averageRevenuePercentage.toFixed(2)}%
          </p>
          <p className="mt-1 text-xs text-gray-400">Average percentage</p>
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

                    <td className="px-4 py-3 text-sm text-gray-600">
                      {row.status}
                    </td>

                    <td className="px-4 py-3 text-right text-sm text-gray-600">
                      {row.totalPaymentUsd ?? "—"}
                    </td>

                    <td className="px-4 py-3 text-right text-sm text-gray-600">
                      {row.totalCostUsd ?? "—"}
                    </td>

                    <td className="px-4 py-3 text-right text-sm text-gray-600">
                      {row.totalRevenueUsd ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
