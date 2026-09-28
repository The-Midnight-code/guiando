"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function GuideNav() {
  const pathname = usePathname();

  const isDashboard = pathname === "/guide/dashboard";
  const isScheduledTours = pathname.startsWith("/guide/scheduled-tours");

  return (
    <nav className="flex items-center gap-6 text-sm">
      <Link
        href="/guide/dashboard"
        className={
          isDashboard
            ? "font-medium underline underline-offset-4"
            : "hover:underline"
        }
      >
        Dashboard
      </Link>

      <Link
        href="/guide/scheduled-tours"
        className={
          isScheduledTours
            ? "font-medium underline underline-offset-4"
            : "hover:underline"
        }
      >
        Scheduled Tours
      </Link>
    </nav>
  );
}
