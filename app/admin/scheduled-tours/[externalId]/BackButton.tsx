"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push("/admin/scheduled-tours")}
      className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50"
    >
      ← Back to Scheduled Tours
    </button>
  );
}
