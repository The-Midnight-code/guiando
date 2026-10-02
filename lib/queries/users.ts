import { db } from "@/db/db";

function validateClerkId(clerkId: string): void {
  if (!clerkId.trim()) {
    throw new Error("Clerk ID is required.");
  }
}

export async function getUserByClerkId(clerkId: string) {
  validateClerkId(clerkId);
  return db.query.users.findFirst({
    where: {
      clerkId,
    },
  });
}

export async function getUsers() {
  return db.query.users.findMany();
}
