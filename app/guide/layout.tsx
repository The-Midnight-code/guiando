import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

interface GuideLayoutProps {
  children: React.ReactNode;
}

export default function GuideLayout({ children }: GuideLayoutProps) {
  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <Link
            href="/guide/dashboard"
            className="text-lg font-semibold hover:underline"
          >
            Guiando
          </Link>

          <nav className="flex items-center gap-6 text-sm">
            <Link href="/guide/dashboard" className="hover:underline">
              Dashboard
            </Link>

            <Link href="/guide/scheduled-tours" className="hover:underline">
              Scheduled Tours
            </Link>
            <UserButton />
          </nav>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
