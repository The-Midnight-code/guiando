interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const normalizedStatus = status.trim().toLowerCase();

  const styles =
    normalizedStatus === "confirmed"
      ? "bg-green-500/15 text-success"
      : normalizedStatus === "pending"
        ? "bg-warning text-warning"
        : normalizedStatus === "cancelled" || normalizedStatus === "canceled"
          ? "bg-error text-error"
          : "bg-gray-100 text-gray-800";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${styles}`}
    >
      {status}
    </span>
  );
}
