"use client";

import { useClerk } from "@clerk/nextjs";

export default function SignOutButton() {
  const { signOut } = useClerk();

  return (
    <button
      type="button"
      onClick={() => signOut({ redirectUrl: "/sign-in" })}
      className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
    >
      Sign out
    </button>
  );
}
