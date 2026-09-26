import { NextResponse } from "next/server";

import { exportFinancialReport } from "@/lib/reports/FinancialReport";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  if (!startDate || !endDate) {
    return NextResponse.json(
      { error: "startDate and endDate are required" },
      { status: 400 },
    );
  }

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
}
