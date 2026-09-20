import { getGuides } from "@/lib/queries/guides";

export default async function TestGuidesPage() {
  const guides = await getGuides();

  return (
    <main className="p-8">
      <h1 className="mb-6 text-2xl font-bold">Guides</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {guides.map((guide) => (
          <article key={guide.id} className="rounded-lg border p-5">
            <h2 className="text-xl font-semibold">
              {guide.user?.firstName} {guide.user?.lastName}
            </h2>

            <div className="mt-4 space-y-1 text-sm">
              <p>
                <strong>Email:</strong> {guide.user?.email}
              </p>

              <p>
                <strong>Phone:</strong> {guide.phone ?? "N/A"}
              </p>

              <p>
                <strong>Role:</strong> {guide.user?.role}
              </p>

              <p>
                <strong>Status:</strong> {guide.active ? "Active" : "Inactive"}
              </p>

              <p>
                <strong>Clerk ID:</strong> {guide.user?.clerkId}
              </p>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
