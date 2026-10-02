import { db } from "@/db/db";
import { guides } from "@/db/schema";

async function main() {
  const user = await db.query.users.findFirst({
    where: {
      email: "ismaellares91@gmail.com",
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const existingGuide = await db.query.guides.findFirst({
    where: {
      userId: user.id,
    },
  });

  if (existingGuide) {
    console.log("Guide already exists:");
    console.log(existingGuide);
    return;
  }

  const [guide] = await db
    .insert(guides)
    .values({
      userId: user.id,
    })
    .returning();

  console.log("Guide created:");
  console.log(guide);
}

main()
  .catch(console.error)
  .finally(() => process.exit());
