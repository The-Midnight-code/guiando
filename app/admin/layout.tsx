import Image from "next/image";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

import AdminNav from "@/components/admin/AdminNav";
import { requireAdmin } from "@/lib/auth/permissions";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  await requireAdmin();

  return (
    <div className="min-h-screen">
      <header className="border-b bg-card">
        <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Link href="/admin" className="flex items-center">
            <Image
              src="/guiandologo.png"
              alt="Guiando"
              width={35}
              height={35}
              priority
            />
          </Link>

          <div className="flex items-center justify-between gap-4 sm:gap-6">
            <AdminNav />
            <UserButton />
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
