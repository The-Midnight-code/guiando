"use client";

import { useRouter } from "next/navigation";

interface ScheduledTourActionsProps {
  externalId: number;
}

export default function ScheduledTourActions({
  externalId,
}: ScheduledTourActionsProps) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => router.push(`/admin/scheduled-tours/${externalId}`)}
        className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
      >
        View
      </button>

      <button
        type="button"
        onClick={() => router.push(`/admin/scheduled-tours/${externalId}/edit`)}
        className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
      >
        Edit
      </button>
    </div>
  );
}
