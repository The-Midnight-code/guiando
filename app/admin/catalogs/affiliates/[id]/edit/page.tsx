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
        <AffiliateForm
          initialData={{
            id: affiliate.id,
            name: affiliate.name,
            description: affiliate.description,
            active: affiliate.active,
          }}
        />
      </div>
    </main>
  );
}
