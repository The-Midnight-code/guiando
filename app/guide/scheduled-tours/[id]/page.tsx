import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { getUserByClerkId } from "@/lib/queries/users";
import { getScheduledTourByUuid } from "@/lib/queries/scheduledTours";
import StatusBadge from "@/components/ui/StatusBadge";
import CompleteTourButton from "@/components/guide/CompleteTourButton";
import Link from "next/link";

interface ScheduledTourPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    status?: string;
    search?: string;
  }>;
}

export default async function GuideScheduledTourPage({
  params,
  searchParams,
}: ScheduledTourPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await getUserByClerkId(userId);

  if (!user) {
    redirect("/guide");
  }

  const { id } = await params;
  const { status, search } = await searchParams;

  const scheduledTour = await getScheduledTourByUuid(id, user.id);

  if (!scheduledTour) {
    notFound();
  }

  const tour = scheduledTour.tour;

  const backParams = new URLSearchParams();

  if (status) {
    backParams.set("status", status);
  }

  if (search) {
    backParams.set("search", search);
  }

  const backQueryString = backParams.toString();

  return (
    <main className="space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-5">
        <Link
          href={
            backQueryString
              ? `/guide/scheduled-tours?${backQueryString}`
              : "/guide/scheduled-tours"
          }
          className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-card-secondary hover:text-foreground"
        >
          <span aria-hidden="true">←</span>
          <span>Back to Scheduled Tours</span>
        </Link>
        <div className="flex flex-col gap-4 rounded-xl border bg-card p-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                {tour?.name}
              </h1>

              <StatusBadge status={scheduledTour.status} />
            </div>

            <div className="flex flex-col gap-1 text-sm text-muted-foreground sm:flex-row sm:gap-4">
              <span>{scheduledTour.tourDate}</span>

              <span className="hidden sm:inline">•</span>

              <span>
                {scheduledTour.startTime ?? "-"}
                {scheduledTour.endTime ? ` - ${scheduledTour.endTime}` : ""}
              </span>

              <span className="hidden sm:inline">•</span>

              <span>{scheduledTour.pickupLocation?.name ?? "-"}</span>
            </div>
          </div>

          {scheduledTour.status === "CONFIRMED" && (
            <CompleteTourButton id={scheduledTour.id} />
          )}
        </div>
      </div>
      <section className="rounded-xl border bg-card">
        <div className="border-b px-6 py-5">
          <h2 className="font-semibold">Tour Information</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Information about the tour
          </p>
        </div>

        <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Tour
            </p>
            <p className="mt-1 font-medium">{tour?.name}</p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Tour Type
            </p>
            <p className="mt-1">{tour?.tourType?.name ?? "-"}</p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Tour Class
            </p>
            <p className="mt-1">{tour?.tourClass?.name ?? "-"}</p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Duration
            </p>
            <p className="mt-1">{tour?.duration ?? "-"}</p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Price
            </p>
            <p className="mt-1 font-medium">{tour?.price ?? "-"}</p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Product ID
            </p>
            <p className="mt-1">{tour?.productId}</p>
          </div>
        </div>

        {tour?.description && (
          <div className="border-t px-6 py-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Description
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {tour.description}
            </p>
          </div>
        )}
      </section>

      <section className="rounded-xl border bg-card">
        <div className="border-b px-6 py-5">
          <h2 className="font-semibold">Schedule</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Date and time information
          </p>
        </div>

        <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Tour Date
            </p>
            <p className="mt-1 font-medium">{scheduledTour.tourDate}</p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Start Time
            </p>
            <p className="mt-1">{scheduledTour.startTime ?? "-"}</p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              End Time
            </p>
            <p className="mt-1">{scheduledTour.endTime ?? "-"}</p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border bg-card">
        <div className="border-b px-6 py-5">
          <h2 className="font-semibold">Pickup Information</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Pickup location and tour route
          </p>
        </div>

        <div className="grid gap-6 p-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Pickup Location
            </p>
            <p className="mt-1 font-medium">
              {scheduledTour.pickupLocation?.name ?? "-"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Start Location
            </p>
            <p className="mt-1">{scheduledTour.locationStart ?? "-"}</p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              End Location
            </p>
            <p className="mt-1">{scheduledTour.locationEnd ?? "-"}</p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border bg-card">
        <div className="border-b px-6 py-5">
          <h2 className="font-semibold">Booking Information</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Booking and payment details
          </p>
        </div>

        <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Booking Date
            </p>
            <p className="mt-1 font-medium">
              {scheduledTour.bookingDate ?? "-"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Affiliate
            </p>
            <p className="mt-1">{scheduledTour.affiliate?.name ?? "-"}</p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Payment Type
            </p>
            <p className="mt-1">{scheduledTour.paymentType?.name ?? "-"}</p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Number of People
            </p>
            <p className="mt-1 font-medium">
              {scheduledTour.numberOfPeople ?? 0}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              External ID
            </p>
            <p className="mt-1">{scheduledTour.externalId}</p>
          </div>
        </div>
      </section>
      <section className="overflow-hidden rounded-xl border bg-card">
        <div className="border-b px-6 py-5">
          <h2 className="font-semibold">Travelers</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Travelers assigned to this tour
          </p>
        </div>

        {scheduledTour.travelerAssignments.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-sm font-medium">No travelers assigned</p>
            <p className="mt-1 text-sm text-muted-foreground">
              There are currently no travelers associated with this tour.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {scheduledTour.travelerAssignments.map(({ traveler }) => (
              <div
                key={traveler?.id}
                className="grid gap-4 px-6 py-5 sm:grid-cols-3"
              >
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Name
                  </p>
                  <p className="mt-1 font-medium">
                    {traveler?.firstName} {traveler?.lastName}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Email
                  </p>
                  <p className="mt-1 break-words text-sm">
                    {traveler?.email ?? "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Phone
                  </p>
                  <p className="mt-1 text-sm">{traveler?.phone ?? "-"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
