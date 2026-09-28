"use client";

interface TourSearchProps {
  value?: string;
  status?: string;
}

export default function TourSearch({ value, status }: TourSearchProps) {
  return (
    <form
      action="/guide/scheduled-tours"
      method="get"
      className="flex w-full flex-col gap-3 sm:flex-row sm:items-center"
    >
      {status && <input type="hidden" name="status" value={status} />}

      <input
        type="text"
        name="search"
        defaultValue={value ?? ""}
        placeholder="Search tours..."
        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary sm:w-64"
      />

      <button
        type="submit"
        className="w-full rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted sm:w-auto"
      >
        Search
      </button>
    </form>
  );
}
