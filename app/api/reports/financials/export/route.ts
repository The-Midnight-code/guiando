import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/permissions";
import { exportFinancialReport } from "@/lib/reports/FinancialReport";

export async function GET(request: Request) {
  await requireAdmin();

  const { searchParams } = new URL(request.url);

  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  if (!startDate || !endDate) {
    return NextResponse.json(
      { error: "startDate and endDate are required." },
      { status: 400 },
    );
  }

  try {
    const csv = await exportFinancialReport({
      startDate,
      endDate,
      tourTypeId: searchParams.get("tourTypeId") || undefined,
      tourId: searchParams.get("tourId") || undefined,
      status: searchParams.get("status") || undefined,
    });

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="financial-report-${startDate}-${endDate}.csv"`,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      const validationErrors = new Set([
        "Start date must be a valid date.",
        "End date must be a valid date.",
        "Start date cannot be later than end date.",
        "Tour ID must be a valid UUID.",
        "Tour type ID must be a valid UUID.",
        "Page must be a positive integer.",
        "Page size must be between 1 and 10000.",
      ]);

      if (validationErrors.has(error.message)) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    console.error("Error exporting financial report:", error);

    return NextResponse.json(
      { error: "Failed to export financial report." },
      { status: 500 },
    );
  }
}
