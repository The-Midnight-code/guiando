"use client";
import Link from "next/link";

export default function BackButton() {
  return (
    <Link
      href="/admin/scheduled-tours"
      className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      ← Back to Scheduled Tours
    </Link>
  );
}
