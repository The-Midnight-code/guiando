"use client";

import { useRouter } from "next/navigation";

interface EditButtonProps {
  externalId: number;
}

export default function EditButton({ externalId }: EditButtonProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push(`/admin/scheduled-tours/${externalId}/edit`)}
      className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
    >
      Edit Scheduled Tour
    </button>
  );
}
