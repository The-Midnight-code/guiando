import Link from "next/link";

import PaymentTypeForm from "../PaymentTypeForm";

export default function NewPaymentTypePage() {
  return (
    <main className="space-y-6">
      <div>
        <Link
          href="/admin/catalogs/payment-types"
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          ← Back to Payment Types
        </Link>
      </div>

      <PaymentTypeForm />
    </main>
  );
}
