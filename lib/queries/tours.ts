import { db } from "@/db/db";

export async function getTours() {
  return db.query.tours.findMany({
    with: {
      tourType: true,
      tourClass: true,
      photos: true,
    },
  });
}

export async function getActiveTours() {
  return db.query.tours.findMany({
    where: {
      active: true,
    },
    with: {
      tourType: true,
      tourClass: true,
      photos: true,
    },
  });
}
