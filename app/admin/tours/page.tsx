import Link from "next/link";

import { getTours } from "@/lib/queries/tours";

import ToursTable from "./ToursTable";

export default async function ToursPage() {
  const tours = await getTours();

  return (
    <main className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Tours</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage tour definitions and information.
          </p>
        </div>

        <Link
          href="/admin/tours/new"
          className="w-full rounded-md bg-primary px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-primary-hover sm:w-auto"
        >
          New Tour
        </Link>
      </div>

      <ToursTable tours={tours} />
    </main>
  );
}
