"use client";

interface StatusFilterProps {
  value?: string;
  search?: string;
}

export default function StatusFilter({ value, search }: StatusFilterProps) {
  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const selectedStatus = event.target.value;

    const params = new URLSearchParams();

    if (selectedStatus !== "all") {
      params.set("status", selectedStatus);
    }

    if (search) {
      params.set("search", search);
    }

    const queryString = params.toString();

    window.location.href = queryString
      ? `/guide/scheduled-tours?${queryString}`
      : "/guide/scheduled-tours";
  }

  return (
    <div className="flex items-center gap-3">
      <label htmlFor="status" className="text-sm font-medium">
        Status
      </label>

      <select
        id="status"
        value={value ?? "all"}
        onChange={handleChange}
        className="rounded-md border bg-background px-3 py-2 text-sm"
      >
        <option value="all">All</option>
        <option value="PENDING">Pending</option>
        <option value="CONFIRMED">Confirmed</option>
        <option value="COMPLETED">Completed</option>
        <option value="CANCELLED">Cancelled</option>
      </select>
    </div>
  );
}
