import Link from "next/link";

import PaymentTypeForm from "../PaymentTypeForm";

export default function NewPaymentTypePage() {
  return (
    <main className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/admin/catalogs/payment-types"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back to Payment Types
        </Link>
      </div>

      <div className="mx-auto max-w-5xl">
        <PaymentTypeForm />
      </div>
    </main>
  );
}
