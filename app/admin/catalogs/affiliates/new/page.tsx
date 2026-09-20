import Link from "next/link";

import AffiliateForm from "../AffiliateForm";

export default function NewAffiliatePage() {
  return (
    <main className="space-y-6">
      <div>
        <Link
          href="/admin/catalogs/affiliates"
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          ← Back to Affiliates
        </Link>
      </div>

      <AffiliateForm />
    </main>
  );
}
