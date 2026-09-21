import { count } from "drizzle-orm";

import { guides, scheduledTours, travelers, tours } from "@/db/schema";

import { db } from "@/db/db";

export async function getAdminDashboardStats() {
  const [scheduledToursResult, toursResult, guidesResult, travelersResult] =
    await Promise.all([
      db.select({ count: count() }).from(scheduledTours),

      db.select({ count: count() }).from(tours),

      db.select({ count: count() }).from(guides),

      db.select({ count: count() }).from(travelers),
    ]);

  return {
    scheduledTours: Number(scheduledToursResult[0]?.count ?? 0),
    tours: Number(toursResult[0]?.count ?? 0),
    guides: Number(guidesResult[0]?.count ?? 0),
    travelers: Number(travelersResult[0]?.count ?? 0),
  };
}
