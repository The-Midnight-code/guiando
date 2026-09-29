import Image from "next/image";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";

import { getUserByClerkId } from "@/lib/queries/users";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await getUserByClerkId(userId);

  if (!user || user.role !== "ADMIN") {
    redirect("/guide/dashboard");
  }

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
