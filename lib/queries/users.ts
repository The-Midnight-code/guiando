import { db } from "@/db/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

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
