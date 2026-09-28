import { headers } from "next/headers";
import { Webhook } from "svix";

import { db } from "@/db/db";
import { users } from "@/db/schema";

type ClerkUserEvent = {
  type: "user.created" | "user.updated";
  data: {
    id: string;
    primary_email_address_id: string | null;
    email_addresses: {
      id: string;
      email_address: string;
    }[];
    first_name: string | null;
    last_name: string | null;
  };
};

export async function POST(request: Request) {
  console.log("1. Webhook received");

  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  console.log("2. Secret exists:", Boolean(webhookSecret));

  if (!webhookSecret) {
    return new Response("Missing CLERK_WEBHOOK_SECRET", {
      status: 500,
    });
  }

  const payload = await request.text();

  console.log("3. Payload received:", payload);

  const headerList = await headers();

  const svixId = headerList.get("svix-id");
  const svixTimestamp = headerList.get("svix-timestamp");
  const svixSignature = headerList.get("svix-signature");

  console.log("4. Svix headers:", {
    svixId: Boolean(svixId),
    svixTimestamp: Boolean(svixTimestamp),
    svixSignature: Boolean(svixSignature),
  });

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing Svix headers", {
      status: 400,
    });
  }

  const webhook = new Webhook(webhookSecret);

  console.log("5. Webhook instance created");

  let event: ClerkUserEvent;

  try {
    webhook.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });

    console.log("6. Signature verified");

    event = JSON.parse(payload) as ClerkUserEvent;

    console.log("7. Event parsed:", event.type);
  } catch (error) {
    console.error("Clerk webhook error:", error);

    return new Response("Invalid webhook", {
      status: 400,
    });
  }

  console.log("8. Continuing with event");

  if (event.type !== "user.created" && event.type !== "user.updated") {
    return new Response("Event ignored", {
      status: 200,
    });
  }

  const { data } = event;

  const primaryEmailId = data.primary_email_address_id;

  const email = data.email_addresses.find(
    (emailAddress) => emailAddress.id === primaryEmailId,
  )?.email_address;

  if (!email) {
    console.error("No primary email found:", {
      primaryEmailId,
      emailAddresses: data.email_addresses,
    });

    return new Response("User has no email", {
      status: 400,
    });
  }

  await db
    .insert(users)
    .values({
      clerkId: data.id,
      email,
      firstName: data.first_name,
      lastName: data.last_name,
      role: "GUIDE",
    })
    .onConflictDoUpdate({
      target: users.clerkId,
      set: {
        email,
        firstName: data.first_name,
        lastName: data.last_name,
        updatedAt: new Date(),
      },
    });

  console.log("9. User synchronized:", data.id);

  return new Response("User synchronized", {
    status: 200,
  });
}
