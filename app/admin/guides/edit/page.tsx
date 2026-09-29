import { notFound } from "next/navigation";

import GuideForm from "../GuideForm";
import { getAdminGuides } from "@/lib/queries/guides";

interface EditGuidePageProps {
  searchParams: Promise<{
    id?: string;
  }>;
}

export default async function EditGuidePage({
  searchParams,
}: EditGuidePageProps) {
  const params = await searchParams;

  if (!params.id) {
    notFound();
  }

  const guides = await getAdminGuides();

  const guide = guides.find((item) => item.id === params.id);

  if (!guide) {
    notFound();
  }

  const guideName = guide.user
    ? `${guide.user.firstName ?? ""} ${guide.user.lastName ?? ""}`.trim() ||
      "Unnamed Guide"
    : "No user assigned";

  return (
    <main className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-semibold">Edit Guide</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Update {guideName}'s information.
        </p>
      </div>

      <section className="max-w-2xl rounded-xl border bg-card p-6">
        <GuideForm
          guideId={guide.id}
          initialPhone={guide.phone}
          initialActive={guide.active}
          initialRole={guide.user?.role ?? "GUIDE"}
        />
      </section>
    </main>
  );
}
