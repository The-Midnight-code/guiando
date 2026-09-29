"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";

export async function inviteGuideAction(email: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const normalizedEmail = email.trim().toLowerCase();

  const client = await clerkClient();

  const { data: pendingInvitations } =
    await client.invitations.getInvitationList({
      status: "pending",
      limit: 100,
    });

  const alreadyInvited = pendingInvitations.some(
    (invitation) =>
      invitation.emailAddress.toLowerCase() === normalizedEmail &&
      invitation.publicMetadata?.role === "GUIDE",
  );

  if (alreadyInvited) {
    throw new Error("There is already a pending invitation for this email.");
  }

  await client.invitations.createInvitation({
    emailAddress: normalizedEmail,
    publicMetadata: {
      role: "GUIDE",
    },
  });
}

export async function revokeGuideInvitationAction(invitationId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const client = await clerkClient();

  await client.invitations.revokeInvitation(invitationId);
}

export async function resendGuideInvitationAction(invitationId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const client = await clerkClient();

  const { data: invitations } = await client.invitations.getInvitationList({
    status: "pending",
    limit: 100,
  });

  const invitation = invitations.find(
    (item) => item.id === invitationId && item.publicMetadata?.role === "GUIDE",
  );

  if (!invitation) {
    throw new Error("Invitation not found.");
  }

  await client.invitations.revokeInvitation(invitationId);

  await client.invitations.createInvitation({
    emailAddress: invitation.emailAddress,
    publicMetadata: {
      role: "GUIDE",
    },
  });
}
