export default function Loading() {
  return (
    <div className="space-y-8">
      <div>
        <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="h-24 animate-pulse rounded-lg border bg-muted/50" />
        <div className="h-24 animate-pulse rounded-lg border bg-muted/50" />
        <div className="h-24 animate-pulse rounded-lg border bg-muted/50" />
      </div>

      <div className="rounded-lg border">
        <div className="border-b px-6 py-4">
          <div className="h-5 w-32 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-4 w-56 animate-pulse rounded bg-muted" />
        </div>

        <div className="space-y-4 p-6">
          <div className="h-10 animate-pulse rounded bg-muted/50" />
          <div className="h-10 animate-pulse rounded bg-muted/50" />
          <div className="h-10 animate-pulse rounded bg-muted/50" />
        </div>
      </div>
    </div>
  );
}
