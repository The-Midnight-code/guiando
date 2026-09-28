import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-semibold">Page not found</h1>

        <p className="text-sm text-muted-foreground">
          The page you are looking for does not exist or is no longer available.
        </p>

        <Link
          href="/"
          className="inline-flex rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}
