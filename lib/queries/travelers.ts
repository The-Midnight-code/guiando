import { db } from "@/db/db";

export async function getTravelers() {
  return db.query.travelers.findMany({
    orderBy: {
      firstName: "asc",
    },
  });
}
