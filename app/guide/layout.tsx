import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import Image from "next/image";

import GuideNav from "@/components/guide/GuideNav";
import { getUserByClerkId } from "@/lib/queries/users";

interface GuideLayoutProps {
  children: React.ReactNode;
}

export default async function GuideLayout({ children }: GuideLayoutProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await getUserByClerkId(userId);
  console.log("Guide auth check:", {
    clerkUserId: userId,
    databaseUser: user,
  });

  if (!user || user.role !== "GUIDE") {
    redirect("/guide");
  }

  return (
    <div className="min-h-screen">
      <header className="border-b bg-card">
        <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Link href="/guide/dashboard" className="flex items-center">
            <Image
              src="/guiandologo.png"
              alt="Guiando"
              width={35}
              height={35}
              priority
            />
          </Link>

          <div className="flex items-center justify-between gap-4 sm:gap-6">
            <GuideNav />
            <UserButton />
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
