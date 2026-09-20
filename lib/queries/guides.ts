import { db } from "@/db/db";

export async function getGuides() {
  return db.query.guides.findMany({
    with: {
      user: true,
    },
  });
}

export async function getActiveGuides() {
  return db.query.guides.findMany({
    where: {
      active: true,
    },
    with: {
      user: true,
    },
  });
}
