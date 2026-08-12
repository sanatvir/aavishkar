import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { Avatar, Chip, PageHeader } from "@/components/ui-kit/primitives";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/lib/app-state";

export const Route = createFileRoute("/app/communities")({
  head: () => ({
    meta: [
      { title: "Communities — AAVISHKAR" },
      { name: "description", content: "Join APSDK student communities for AI, robotics, coding, design and more." },
      { property: "og:title", content: "Communities — AAVISHKAR" },
      { property: "og:description", content: "Where APSDK students gather around what they love building." },
    ],
  }),
  component: CommunitiesPage,
});

function CommunitiesPage() {
  const { joinedCommunities, toggleCommunity, communities } = useAppState();

  return (
    <>
      <PageHeader title="Communities" subtitle="Find your people around the things you like building." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {communities.map((c) => {
          const joined = joinedCommunities.includes(c.id);
          return (
            <article key={c.id} className="surface lift flex h-full flex-col gap-4 p-5">
              <div className="flex items-start gap-3">
                <Avatar initials={c.name.slice(0, 2).toUpperCase()} accent={c.accent} />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold">{c.name}</h3>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" /> {c.members} members
                  </p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{c.description}</p>
              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Recent activity
                </p>
                {c.activity.map((a) => (
                  <p key={a} className="text-xs text-foreground/75">
                    · {a}
                  </p>
                ))}
              </div>
              <div className="mt-auto flex items-center gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  variant={joined ? "secondary" : "default"}
                  onClick={() => toggleCommunity(c.id, c.name)}
                >
                  {joined ? "Joined" : "Join"}
                </Button>
                {joined && <Chip tone="success">Member</Chip>}
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
