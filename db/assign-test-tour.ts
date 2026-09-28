import { db } from "@/db/db";
import { scheduledTourGuides } from "@/db/schema";

async function main() {
  const [assignment] = await db
    .insert(scheduledTourGuides)
    .values({
      scheduledTourId: "970c80b2-c836-4935-9d25-f1a77c9b1d71",
      guideId: "e0d1c5e6-7444-480b-9399-bfc3ef46ced2",
    })
    .returning();

  console.log("Assignment created:");
  console.log(assignment);
}

main()
  .catch(console.error)
  .finally(() => process.exit());
