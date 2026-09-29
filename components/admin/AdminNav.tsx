"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminNav() {
  const pathname = usePathname();

  const isDashboard = pathname === "/admin";
  const isScheduledTours = pathname.startsWith("/admin/scheduled-tours");
  const isTours = pathname.startsWith("/admin/tours");
  const isGuides = pathname.startsWith("/admin/guides");
  const isTravelers = pathname.startsWith("/admin/travelers");
  const isReports = pathname.startsWith("/admin/reports");

  return (
    <nav className="flex items-center gap-6 text-sm">
      <Link
        href="/admin"
        className={
          isDashboard
            ? "font-medium text-primary"
            : "text-muted-foreground transition-colors hover:text-foreground"
        }
      >
        Dashboard
      </Link>

      <Link
        href="/admin/scheduled-tours"
        className={
          isScheduledTours
            ? "font-medium text-primary"
            : "text-muted-foreground transition-colors hover:text-foreground"
        }
      >
        Scheduled Tours
      </Link>

      <Link
        href="/admin/tours"
        className={
          isTours
            ? "font-medium text-primary"
            : "text-muted-foreground transition-colors hover:text-foreground"
        }
      >
        Tours
      </Link>

      <Link
        href="/admin/guides"
        className={
          isGuides
            ? "font-medium text-primary"
            : "text-muted-foreground transition-colors hover:text-foreground"
        }
      >
        Guides
      </Link>

      <Link
        href="/admin/travelers"
        className={
          isTravelers
            ? "font-medium text-primary"
            : "text-muted-foreground transition-colors hover:text-foreground"
        }
      >
        Travelers
      </Link>

      <Link
        href="/admin/reports"
        className={
          isReports
            ? "font-medium text-primary"
            : "text-muted-foreground transition-colors hover:text-foreground"
        }
      >
        Reports
      </Link>
    </nav>
  );
}
