import Link from "next/link";

import AffiliateForm from "../AffiliateForm";

export default function NewAffiliatePage() {
  return (
    <main className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/admin/catalogs/affiliates"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back to Affiliates
        </Link>
      </div>

      <div className="mx-auto max-w-5xl">
        <AffiliateForm />
      </div>
    </main>
  );
}
