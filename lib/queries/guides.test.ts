import { beforeEach, describe, expect, it, vi } from "vitest";

const getInvitationList = vi.fn();

vi.mock("@clerk/nextjs/server", () => ({
  clerkClient: vi.fn(async () => ({
    invitations: {
      getInvitationList,
    },
  })),
}));

import { getPendingGuideInvitations } from "./guides";

describe("getPendingGuideInvitations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns only pending guide invitations", async () => {
    const invitations = [
      {
        id: "invitation-guide-1",
        emailAddress: "guide1@example.com",
        status: "pending",
        publicMetadata: {
          role: "GUIDE",
        },
      },
      {
        id: "invitation-admin-1",
        emailAddress: "admin@example.com",
        status: "pending",
        publicMetadata: {
          role: "ADMIN",
        },
      },
      {
        id: "invitation-guide-2",
        emailAddress: "guide2@example.com",
        status: "pending",
        publicMetadata: {
          role: "GUIDE",
        },
      },
      {
        id: "invitation-no-role",
        emailAddress: "unknown@example.com",
        status: "pending",
        publicMetadata: {},
      },
    ];

    getInvitationList.mockResolvedValue({
      data: invitations,
    });

    const result = await getPendingGuideInvitations();

    expect(result).toEqual([invitations[0], invitations[2]]);
  });

  it("requests pending invitations with a limit of 100", async () => {
    getInvitationList.mockResolvedValue({
      data: [],
    });

    await getPendingGuideInvitations();

    expect(getInvitationList).toHaveBeenCalledWith({
      status: "pending",
      limit: 100,
    });
  });

  it("returns an empty array when there are no guide invitations", async () => {
    getInvitationList.mockResolvedValue({
      data: [
        {
          id: "invitation-admin-1",
          emailAddress: "admin@example.com",
          status: "pending",
          publicMetadata: {
            role: "ADMIN",
          },
        },
      ],
    });

    const result = await getPendingGuideInvitations();

    expect(result).toEqual([]);
  });

  it("propagates Clerk errors", async () => {
    getInvitationList.mockRejectedValue(new Error("Clerk API unavailable"));

    await expect(getPendingGuideInvitations()).rejects.toThrow(
      "Clerk API unavailable",
    );
  });
});
