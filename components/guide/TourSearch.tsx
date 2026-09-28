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
      className="flex items-center gap-3"
    >
      {status && <input type="hidden" name="status" value={status} />}

      <input
        type="text"
        name="search"
        defaultValue={value ?? ""}
        placeholder="Search tours..."
        className="rounded-md border bg-background px-3 py-2 text-sm"
      />

      <button
        type="submit"
        className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
      >
        Search
      </button>
    </form>
  );
}
