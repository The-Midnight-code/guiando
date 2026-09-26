import { getFinancialReportRows } from "@/lib/queries/financials";

export async function exportFinancialReport(filters: {
  startDate: string;
  endDate: string;
  tourId?: string;
  tourTypeId?: string;
  status?: string;
}) {
  const report = await getFinancialReportRows(filters, 1, 10000);

  const headers = [
    "Date",
    "Tour",
    "People",
    "Status",
    "Payment (USD)",
    "Guide Cost (MXN)",
    "Transportation Cost (MXN)",
    "Travelers Cost (MXN)",
    "Extra Expenses (MXN)",
    "Total Cost (USD)",
    "Revenue (USD)",
    "Margin (%)",
    "Exchange Rate",
  ];

  const rows = report.rows.map((row) => [
    row.tourDate,
    row.tourName,
    row.numberOfPeople ?? "",
    row.status,
    row.totalPaymentUsd ?? "",
    row.guideCostMxn ?? "",
    row.transportationCostMxn ?? "",
    row.travelersCostMxn ?? "",
    row.extraExpensesMxn ?? "",
    row.totalCostUsd ?? "",
    row.totalRevenueUsd ?? "",
    row.revenuePercentage ?? "",
    row.exchangeRate ?? "",
  ]);

  const escapeCsvValue = (value: unknown) => {
    const stringValue = String(value ?? "");

    if (
      stringValue.includes(",") ||
      stringValue.includes('"') ||
      stringValue.includes("\n")
    ) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
  };

  return [
    headers.map(escapeCsvValue).join(","),
    ...rows.map((row) => row.map(escapeCsvValue).join(",")),
  ].join("\n");
}
