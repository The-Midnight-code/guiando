"use server";

import { clerkClient } from "@clerk/nextjs/server";

import { requireAdmin } from "@/lib/auth/permissions";

export async function inviteGuideAction(
  email: string,
  role: "ADMIN" | "GUIDE",
) {
  await requireAdmin();

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
      invitation.publicMetadata?.role === role,
  );

  if (alreadyInvited) {
    throw new Error("There is already a pending invitation for this email.");
  }

  await client.invitations.createInvitation({
    emailAddress: normalizedEmail,
    publicMetadata: {
      role,
    },
  });
}

export async function revokeGuideInvitationAction(invitationId: string) {
  await requireAdmin();

  const client = await clerkClient();

  await client.invitations.revokeInvitation(invitationId);
}

export async function resendGuideInvitationAction(invitationId: string) {
  await requireAdmin();

  const client = await clerkClient();

  const { data: invitations } = await client.invitations.getInvitationList({
    status: "pending",
    limit: 100,
  });

  const invitation = invitations.find((item) => item.id === invitationId);

  if (!invitation) {
    throw new Error("Invitation not found.");
  }

  const role = invitation.publicMetadata?.role === "ADMIN" ? "ADMIN" : "GUIDE";

  await client.invitations.revokeInvitation(invitationId);

  await client.invitations.createInvitation({
    emailAddress: invitation.emailAddress,
    publicMetadata: {
      role,
    },
  });
}
