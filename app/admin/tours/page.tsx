import Link from "next/link";

import { getTours } from "@/lib/queries/tours";

import ToursTable from "./ToursTable";

export default async function ToursPage() {
  const tours = await getTours();

  return (
    <main className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tours</h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage tour definitions and information.
          </p>
        </div>

        <Link
          href="/admin/tours/new"
          className="rounded-md bg-[#3B82F6] px-4 py-2 text-sm font-medium"
        >
          New Tour
        </Link>
      </div>

      <ToursTable tours={tours} />
    </main>
  );
}
