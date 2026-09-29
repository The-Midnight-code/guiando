"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiEdit, FiEye, FiMoreVertical } from "react-icons/fi";

interface TourActionsProps {
  id: string;
}

export default function TourActions({ id }: TourActionsProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Open actions"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors hover:bg-card-secondary"
      >
        <FiMoreVertical className="text-base" />
        <span>Actions</span>
      </button>

      {open && (
        <div className="absolute right-0 z-10 mt-2 w-40 overflow-hidden rounded-md border bg-card shadow-lg">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              router.push(`/admin/tours/${id}`);
            }}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-card-secondary"
          >
            <FiEye className="text-base text-muted-foreground" />
            <span>View</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              router.push(`/admin/tours/${id}/edit`);
            }}
            className="flex w-full items-center gap-3 border-t px-4 py-3 text-left text-sm transition-colors hover:bg-card-secondary"
          >
            <FiEdit className="text-base text-muted-foreground" />
            <span>Edit</span>
          </button>
        </div>
      )}
    </div>
  );
}
