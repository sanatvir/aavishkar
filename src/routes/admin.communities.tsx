import { createFileRoute } from "@tanstack/react-router";
import { Avatar, Chip, PageHeader } from "@/components/ui-kit/primitives";
import { useAppState } from "@/lib/app-state";

export const Route = createFileRoute("/admin/communities")({
  head: () => ({
    meta: [
      { title: "Communities — AAVISHKAR Admin" },
      { name: "description", content: "Membership and activity across APSDK student communities." },
      { property: "og:title", content: "Communities — AAVISHKAR Admin" },
      { property: "og:description", content: "Community membership and engagement overview." },
    ],
  }),
  component: AdminCommunities,
});

function AdminCommunities() {
  const { communities } = useAppState();

  return (
    <>
      <PageHeader title="Communities" subtitle="Membership and activity across student communities." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {communities.map((c) => (
          <article key={c.id} className="surface p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">{c.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
              </div>
              <Chip tone="accent">{c.members} members</Chip>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {c.activity.map((a) => (
                <li key={a}>• {a}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </>
  );
}
