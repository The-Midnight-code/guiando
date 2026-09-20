import Link from "next/link";
import { notFound } from "next/navigation";

import { getAffiliateById } from "@/lib/queries/affiliates";

import AffiliateForm from "../../AffiliateForm";

interface EditAffiliatePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditAffiliatePage({
  params,
}: EditAffiliatePageProps) {
  const { id } = await params;

  const affiliate = await getAffiliateById(id);

  if (!affiliate) {
    notFound();
  }

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

      <AffiliateForm
        initialData={{
          id: affiliate.id,
          name: affiliate.name,
          description: affiliate.description,
          active: affiliate.active,
        }}
      />
    </main>
  );
}
