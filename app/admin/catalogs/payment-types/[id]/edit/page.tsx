import Link from "next/link";
import { notFound } from "next/navigation";

import { getPaymentTypeById } from "@/lib/queries/paymentTypes";

import PaymentTypeForm from "../../PaymentTypeForm";

interface EditPaymentTypePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditPaymentTypePage({
  params,
}: EditPaymentTypePageProps) {
  const { id } = await params;

  const paymentType = await getPaymentTypeById(id);

  if (!paymentType) {
    notFound();
  }

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

      <PaymentTypeForm
        initialData={{
          id: paymentType.id,
          name: paymentType.name,
          description: paymentType.description,
          active: paymentType.active,
        }}
      />
    </main>
  );
}
