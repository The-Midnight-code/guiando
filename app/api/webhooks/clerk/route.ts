import { headers } from "next/headers";
import { Webhook } from "svix";

import { db } from "@/db/db";
import { guides, users } from "@/db/schema";

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
    public_metadata: {
      role?: string;
    };
  };
};

export async function POST(request: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return new Response("Missing CLERK_WEBHOOK_SECRET", {
      status: 500,
    });
  }

  const payload = await request.text();

  const headerList = await headers();

  const svixId = headerList.get("svix-id");
  const svixTimestamp = headerList.get("svix-timestamp");
  const svixSignature = headerList.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing Svix headers", {
      status: 400,
    });
  }

  const webhook = new Webhook(webhookSecret);

  let event: ClerkUserEvent;

  try {
    webhook.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });

    event = JSON.parse(payload) as ClerkUserEvent;

    if (!event.data?.id || !Array.isArray(event.data.email_addresses)) {
      return new Response("Invalid webhook payload", {
        status: 400,
      });
    }
  } catch (error) {
    console.error("Clerk webhook error:", error);

    return new Response("Invalid webhook", {
      status: 400,
    });
  }

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

  try {
    const [syncedUser] = await db
      .insert(users)
      .values({
        clerkId: data.id,
        email,
        firstName: data.first_name,
        lastName: data.last_name,
        role: data.public_metadata.role === "ADMIN" ? "ADMIN" : "GUIDE",
      })
      .onConflictDoUpdate({
        target: users.clerkId,
        set: {
          email,
          firstName: data.first_name,
          lastName: data.last_name,
          updatedAt: new Date(),
        },
      })
      .returning({
        id: users.id,
        role: users.role,
      });

    if (syncedUser.role === "GUIDE") {
      await db
        .insert(guides)
        .values({
          userId: syncedUser.id,
          active: true,
        })
        .onConflictDoNothing({
          target: guides.userId,
        });
    }
  } catch (error) {
    console.error("Failed to synchronize Clerk user:", error);

    return new Response("Failed to synchronize user", {
      status: 500,
    });
  }

  return new Response("User synchronized", {
    status: 200,
  });
}
