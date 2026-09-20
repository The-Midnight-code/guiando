import "dotenv/config";

import { db } from "./db";
import { scheduledTours } from "./schema";

async function testRelations() {
  console.log("Testing database relations...");

  const result = await db.query.scheduledTours.findFirst({
    with: {
      tour: {
        with: {
          tourType: true,
          tourClass: true,
          photos: true,
        },
      },
      pickupLocation: true,
      affiliate: true,
      paymentType: true,
      guideAssignments: {
        with: {
          guide: {
            with: {
              user: true,
            },
          },
        },
      },
      travelerAssignments: {
        with: {
          traveler: true,
        },
      },
      financials: true,
    },
  });

  console.dir(result, { depth: null });
}

testRelations().catch((error) => {
  console.error("Relation test failed:", error);
  process.exit(1);
});
