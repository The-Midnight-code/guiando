import { clerkClient } from "@clerk/nextjs/server";
import Image from "next/image";

import {
  getAdminGuides,
  getPendingGuideInvitations,
} from "@/lib/queries/guides";
import PendingInvitationCard from "./PendingInvitationCard";

export default async function AdminGuidesPage() {
  const [guides, pendingInvitations] = await Promise.all([
    getAdminGuides(),
    getPendingGuideInvitations(),
  ]);

  const guideImageMap = new Map<string, string>();

  const clerkIds = guides
    .map((guide) => guide.user?.clerkId)
    .filter((clerkId): clerkId is string => Boolean(clerkId));

  const uniqueClerkIds = [...new Set(clerkIds)];

  if (uniqueClerkIds.length > 0) {
    const client = await clerkClient();

    const { data: clerkUsers } = await client.users.getUserList({
      userId: uniqueClerkIds,
    });

    for (const user of clerkUsers) {
      guideImageMap.set(user.id, user.imageUrl);
    }
  }

  const guidesWithImages = guides.map((guide) => ({
    ...guide,
    imageUrl: guide.user?.clerkId
      ? (guideImageMap.get(guide.user.clerkId) ?? null)
      : null,
  }));

  return (
    <main className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Guides</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage your tour guides.
          </p>
        </div>

        <a
          href="/admin/guides/invite"
          className="shrink-0 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
        >
          New Guide
        </a>
      </div>

      {pendingInvitations.length > 0 && (
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">
              Pending Invitations ({pendingInvitations.length})
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Guides who have not completed their registration yet.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pendingInvitations.map((invitation) => (
              <PendingInvitationCard
                key={invitation.id}
                invitationId={invitation.id}
                email={invitation.emailAddress}
              />
            ))}
          </div>
        </section>
      )}

      {guidesWithImages.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold">
            Registered Guides ({guidesWithImages.length})
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Guides who have completed their registration.
          </p>
        </div>
      )}

      {guidesWithImages.length === 0 ? (
        <section className="rounded-xl border bg-card">
          <div className="px-6 py-14 text-center">
            <p className="text-sm font-medium">No guides found</p>

            <p className="mt-1 text-sm text-muted-foreground">
              There are currently no guides registered.
            </p>
          </div>
        </section>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {guidesWithImages.map((guide) => {
            const guideName = guide.user
              ? `${guide.user.firstName ?? ""} ${
                  guide.user.lastName ?? ""
                }`.trim() || "Unnamed Guide"
              : "No user assigned";

            const initials =
              guideName !== "Unnamed Guide" && guideName !== "No user assigned"
                ? guideName.charAt(0).toUpperCase()
                : "—";

            return (
              <article
                key={guide.id}
                className="rounded-xl border bg-card p-5 transition-colors hover:bg-card-secondary"
              >
                <div className="flex items-center gap-4">
                  <div className="shrink-0">
                    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-card-secondary text-lg font-semibold">
                      {guide.imageUrl ? (
                        <Image
                          src={guide.imageUrl}
                          alt={guideName}
                          width={56}
                          height={56}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        initials
                      )}
                    </div>
                  </div>

                  <div className="min-w-0">
                    <h2 className="truncate font-semibold">{guideName}</h2>

                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {guide.user?.email ?? "No email"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3 border-t pt-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Phone
                    </p>

                    <p className="mt-1 text-sm">{guide.phone ?? "No phone"}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Status
                    </p>

                    <p
                      className={`mt-1 text-sm font-medium ${
                        guide.active ? "text-success" : "text-error"
                      }`}
                    >
                      {guide.active ? "Active" : "Inactive"}
                    </p>
                  </div>
                  <div className="mt-5 flex justify-end border-t pt-4">
                    <a
                      href={`/admin/guides/edit?id=${guide.id}`}
                      className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-card-secondary"
                    >
                      Edit Guide
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
