"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <Link
      href="/admin/scheduled-tours"
      className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      ← Back to Scheduled Tours
    </Link>
  );
}
