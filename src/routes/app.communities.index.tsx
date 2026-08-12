import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Avatar, Chip, PageHeader } from "@/components/ui-kit/primitives";
import { ApplyToCommunityButton } from "@/components/ApplyToCommunityButton";
import { LeaveCommunityButton } from "@/components/LeaveCommunityButton";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/lib/app-state";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/communities/")({
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

type Filter = "all" | "joined";

function CommunitiesPage() {
  const { joinedCommunities, communities, getCommunityMemberIds, findStudent, getCommunityJoinStatus } =
    useAppState();
  const [filter, setFilter] = useState<Filter>("all");

  const visible = useMemo(() => {
    if (filter === "joined") return communities.filter((c) => joinedCommunities.includes(c.id));
    return communities;
  }, [communities, filter, joinedCommunities]);

  return (
    <>
      <PageHeader title="Communities" subtitle="Find your people around the things you like building." />

      <div className="mb-6 flex flex-wrap gap-2">
        {(
          [
            { id: "all" as const, label: "All communities" },
            { id: "joined" as const, label: "My communities" },
          ] as const
        ).map((f) => (
          <Button
            key={f.id}
            size="sm"
            variant={filter === f.id ? "default" : "outline"}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
            {f.id === "joined" && joinedCommunities.length > 0 && (
              <span className="ml-1.5 opacity-80">({joinedCommunities.length})</span>
            )}
          </Button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="surface p-10 text-center">
          <p className="font-medium">You haven&apos;t joined any communities yet.</p>
          <p className="mt-2 text-sm text-muted-foreground">Browse all communities and apply to the ones that match your interests.</p>
          <Button size="sm" className="mt-4" onClick={() => setFilter("all")}>
            Browse all
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((c) => {
            const joined = joinedCommunities.includes(c.id);
            const joinStatus = getCommunityJoinStatus(c.id);
            const memberIds = getCommunityMemberIds(c.id);
            const previewMembers = memberIds.slice(0, 4).map((id) => findStudent(id)).filter(Boolean);
            const nextSession = c.sessions[0];

            return (
              <article key={c.id} className="surface lift flex h-full flex-col gap-4 p-5">
                <div className="flex items-start gap-3">
                  <Avatar initials={c.name.slice(0, 2).toUpperCase()} accent={c.accent} />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold">{c.name}</h3>
                    {joined && (
                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" /> {memberIds.length || c.members} members
                      </p>
                    )}
                  </div>
                  {joined && <Chip tone="success">Member</Chip>}
                  {!joined && joinStatus === "pending" && <Chip tone="accent">Pending</Chip>}
                </div>

                <p className="text-sm leading-relaxed text-muted-foreground">{c.description}</p>

                {joined && nextSession && (
                  <div className={cn("rounded-xl border border-border px-3 py-2.5 text-xs")}>
                    <p className="flex items-center gap-1.5 font-medium text-foreground">
                      <CalendarDays className="h-3.5 w-3.5 text-accent" /> {nextSession.title}
                    </p>
                    <p className="mt-1 text-muted-foreground">{nextSession.when} · {nextSession.place}</p>
                  </div>
                )}

                {joined && previewMembers.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {previewMembers.map((s) =>
                        s ? (
                          <Avatar
                            key={s.id}
                            initials={s.initials}
                            accent={s.accent}
                            name={s.name}
                            size="sm"
                            src={s.avatarUrl}
                          />
                        ) : null,
                      )}
                    </div>
                    {memberIds.length > 4 && (
                      <span className="text-xs text-muted-foreground">+{memberIds.length - 4} more</span>
                    )}
                  </div>
                )}

                <div className="mt-auto flex flex-col gap-2 sm:flex-row sm:items-center">
                  {joined ? (
                    <>
                      <Button asChild size="sm" variant="outline" className="flex-1 gap-1.5">
                        <Link to="/app/communities/$id" params={{ id: c.id }}>
                          Open community <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                      <LeaveCommunityButton communityId={c.id} communityName={c.name} size="sm" className="flex-1">
                        Leave
                      </LeaveCommunityButton>
                    </>
                  ) : (
                    <ApplyToCommunityButton communityId={c.id} communityName={c.name} size="sm" className="w-full" />
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
