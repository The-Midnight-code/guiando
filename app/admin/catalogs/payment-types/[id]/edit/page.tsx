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
        <PaymentTypeForm
          initialData={{
            id: paymentType.id,
            name: paymentType.name,
            description: paymentType.description,
            active: paymentType.active,
          }}
        />
      </div>
    </main>
  );
}
