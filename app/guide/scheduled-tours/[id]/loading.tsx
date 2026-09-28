export default function Loading() {
  return (
    <main className="space-y-6 p-8">
      <div className="h-5 w-40 animate-pulse rounded bg-muted" />

      <div>
        <div className="h-9 w-72 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-5 w-full max-w-2xl animate-pulse rounded bg-muted" />
      </div>

      <div className="flex items-center gap-3">
        <div className="h-7 w-24 animate-pulse rounded-full bg-muted" />
        <div className="h-9 w-36 animate-pulse rounded-md bg-muted" />
      </div>

      <section className="rounded-lg border p-6">
        <div className="mb-4 h-7 w-40 animate-pulse rounded bg-muted" />

        <div className="grid gap-4 md:grid-cols-3">
          <div className="h-12 animate-pulse rounded bg-muted/50" />
          <div className="h-12 animate-pulse rounded bg-muted/50" />
          <div className="h-12 animate-pulse rounded bg-muted/50" />
        </div>
      </section>

      <section className="rounded-lg border p-6">
        <div className="mb-4 h-7 w-32 animate-pulse rounded bg-muted" />

        <div className="grid gap-4 md:grid-cols-4">
          <div className="h-12 animate-pulse rounded bg-muted/50" />
          <div className="h-12 animate-pulse rounded bg-muted/50" />
          <div className="h-12 animate-pulse rounded bg-muted/50" />
          <div className="h-12 animate-pulse rounded bg-muted/50" />
        </div>
      </section>

      <section className="rounded-lg border p-6">
        <div className="mb-4 h-7 w-48 animate-pulse rounded bg-muted" />

        <div className="space-y-3">
          <div className="h-5 w-3/4 animate-pulse rounded bg-muted/50" />
          <div className="h-5 w-2/3 animate-pulse rounded bg-muted/50" />
          <div className="h-5 w-4/5 animate-pulse rounded bg-muted/50" />
          <div className="h-5 w-1/2 animate-pulse rounded bg-muted/50" />
        </div>
      </section>

      <section className="rounded-lg border p-6">
        <div className="mb-4 h-7 w-48 animate-pulse rounded bg-muted" />

        <div className="grid gap-4 md:grid-cols-3">
          <div className="h-12 animate-pulse rounded bg-muted/50" />
          <div className="h-12 animate-pulse rounded bg-muted/50" />
          <div className="h-12 animate-pulse rounded bg-muted/50" />
        </div>
      </section>

      <section className="rounded-lg border p-6">
        <div className="mb-4 h-7 w-32 animate-pulse rounded bg-muted" />

        <div className="space-y-3">
          <div className="h-10 animate-pulse rounded bg-muted/50" />
          <div className="h-10 animate-pulse rounded bg-muted/50" />
          <div className="h-10 animate-pulse rounded bg-muted/50" />
        </div>
      </section>
    </main>
  );
}
