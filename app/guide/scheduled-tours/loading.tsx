export default function Loading() {
  return (
    <main className="space-y-6 p-8">
      <div>
        <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
        <div className="mt-2 h-4 w-64 animate-pulse rounded-md bg-muted" />
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="h-10 w-64 animate-pulse rounded-md bg-muted" />
        <div className="h-10 w-32 animate-pulse rounded-md bg-muted" />
      </div>

      <section className="rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="px-6 py-3">
                  <div className="h-4 w-12 animate-pulse rounded bg-muted" />
                </th>
                <th className="px-6 py-3">
                  <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                </th>
                <th className="px-6 py-3">
                  <div className="h-4 w-16 animate-pulse rounded bg-muted" />
                </th>
                <th className="px-6 py-3">
                  <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                </th>
                <th className="px-6 py-3">
                  <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                </th>
                <th className="px-6 py-3">
                  <div className="h-4 w-16 animate-pulse rounded bg-muted" />
                </th>
              </tr>
            </thead>

            <tbody>
              {Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="border-b last:border-0">
                  <td className="px-6 py-4">
                    <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-28 animate-pulse rounded bg-muted" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-12 animate-pulse rounded bg-muted" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
