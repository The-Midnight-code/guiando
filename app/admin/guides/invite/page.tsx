import InviteGuideForm from "./InviteGuideForm";

export default function InviteGuidePage() {
  return (
    <main className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-semibold">Invite Guide</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Send an invitation so the guide can create their Clerk account.
        </p>
      </div>

      <section className="max-w-2xl rounded-xl border bg-card p-6">
        <InviteGuideForm />
      </section>
    </main>
  );
}
