import { db } from "@/db/db";

export async function getUserByClerkId(clerkId: string) {
  return db.query.users.findFirst({
    where: {
      clerkId,
    },
  });
}

export async function getUsers() {
  return db.query.users.findMany();
}
