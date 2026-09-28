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
            ? "font-medium text-primary"
            : "text-muted-foreground transition-colors hover:text-foreground"
        }
      >
        Dashboard
      </Link>

      <Link
        href="/guide/scheduled-tours"
        className={
          isScheduledTours
            ? "font-medium text-primary"
            : "text-muted-foreground transition-colors hover:text-foreground"
        }
      >
        Scheduled Tours
      </Link>
    </nav>
  );
}
