import { getTravelers } from "@/lib/queries/travelers";

export default async function TestTravelersPage() {
  const travelers = await getTravelers();

  return (
    <main className="p-8">
      <h1 className="mb-6 text-2xl font-bold">Travelers</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {travelers.map((traveler) => (
          <article key={traveler.id} className="rounded-lg border p-5">
            <h2 className="text-xl font-semibold">
              {traveler.firstName} {traveler.lastName ?? ""}
            </h2>

            <div className="mt-4 space-y-1 text-sm">
              <p>
                <strong>Email:</strong> {traveler.email ?? "N/A"}
              </p>

              <p>
                <strong>Phone:</strong> {traveler.phone ?? "N/A"}
              </p>

              <p>
                <strong>ID:</strong> {traveler.id}
              </p>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
