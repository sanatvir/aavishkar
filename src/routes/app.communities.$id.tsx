import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, CalendarDays, Lock, MapPin, Megaphone, ShieldCheck, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { StudentCard } from "@/components/cards";
import { ApplyToCommunityButton } from "@/components/ApplyToCommunityButton";
import { LeaveCommunityButton } from "@/components/LeaveCommunityButton";
import { Avatar, Chip, PageHeader, SectionHeading } from "@/components/ui-kit/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppState } from "@/lib/app-state";
import { COORDINATOR_AUTHOR_ID } from "@/lib/session";

export const Route = createFileRoute("/app/communities/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Community — ${params.id} — AAVISHKAR` },
      { name: "description", content: "Community feed, sessions and members on AAVISHKAR." },
    ],
  }),
  component: CommunityDetail,
});

function CommunityDetail() {
  const { id } = Route.useParams();
  const {
    communities,
    joinedCommunities,
    getCommunityJoinStatus,
    getCommunityMemberIds,
    findStudent,
    students,
    communityPosts,
    platformSettings,
  } = useAppState();
  const [search, setSearch] = useState("");

  const community = communities.find((c) => c.id === id);
  const memberIds = getCommunityMemberIds(id);
  const members = useMemo(
    () => memberIds.map((sid) => findStudent(sid)).filter(Boolean) as typeof students,
    [memberIds, findStudent, students],
  );
  const posts = useMemo(
    () => communityPosts.filter((p) => p.communityId === id),
    [communityPosts, id],
  );

  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.skills.some((sk) => sk.toLowerCase().includes(q)) ||
        s.interests.some((i) => i.toLowerCase().includes(q)),
    );
  }, [members, search]);

  if (!community) {
    return (
      <div className="surface p-10 text-center">
        <p className="font-medium">That community isn&apos;t here.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/app/communities">Back to Communities</Link>
        </Button>
      </div>
    );
  }

  const joined = joinedCommunities.includes(id);
  const joinStatus = getCommunityJoinStatus(id);

  const authorLabel = (authorId: string) =>
    authorId === COORDINATOR_AUTHOR_ID
      ? platformSettings.coordinatorName
      : findStudent(authorId)?.name ?? "ATL Coordinator";

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="mb-6 gap-1.5">
        <Link to="/app/communities">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Communities
        </Link>
      </Button>

      <PageHeader
        title={community.name}
        subtitle={community.description}
        action={
          joined ? (
            <LeaveCommunityButton communityId={id} communityName={community.name}>
              Leave community
            </LeaveCommunityButton>
          ) : (
            <ApplyToCommunityButton communityId={id} communityName={community.name} />
          )
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Avatar initials={community.name.slice(0, 2).toUpperCase()} accent={community.accent} size="lg" />
        {joined && (
          <>
            <Chip tone="accent">
              <Users className="h-3 w-3" /> {members.length || community.members} members
            </Chip>
            {community.sessions[0] && (
              <Chip>
                <CalendarDays className="h-3 w-3" /> Next: {community.sessions[0].title}
              </Chip>
            )}
            <Chip tone="success">You&apos;re a member</Chip>
          </>
        )}
        {!joined && joinStatus === "pending" && <Chip tone="accent">Application pending</Chip>}
        {!joined && joinStatus === "rejected" && <Chip tone="neutral">Not accepted — you can apply again</Chip>}
      </div>

      {!joined ? (
        <div className="surface p-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
            <Lock className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="mt-4 font-medium">Members-only community</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            {joinStatus === "pending"
              ? "Your application is with the coordinator. You'll get access to the feed, sessions, resources and members once you're accepted."
              : "Apply to join to access the feed, sessions, resources and member directory."}
          </p>
          {joinStatus !== "pending" && (
            <div className="mt-6 flex justify-center">
              <ApplyToCommunityButton communityId={id} communityName={community.name} />
            </div>
          )}
        </div>
      ) : (
      <Tabs defaultValue="overview" className="mt-2">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members ({members.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-6">
            <section className="surface p-6">
              <SectionHeading title="Community feed" subtitle="Official updates from ATL coordinators" />
              <p className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm text-muted-foreground">
                <ShieldCheck className="h-4 w-4 shrink-0 text-accent" />
                Only coordinators can post here. Apply to join and stay updated once accepted.
              </p>

              <ul className="mt-6 space-y-4">
                {posts.map((p) => {
                  const isCoordinator = p.authorId === COORDINATOR_AUTHOR_ID;
                  const author = findStudent(p.authorId);
                  return (
                    <li key={p.id} className="flex gap-3 rounded-xl border border-border p-4">
                      <Avatar
                        initials={
                          isCoordinator
                            ? platformSettings.coordinatorName.slice(0, 2).toUpperCase()
                            : (author?.initials ?? "AC")
                        }
                        accent={isCoordinator ? community.accent : author?.accent}
                        size="sm"
                        src={isCoordinator ? platformSettings.coordinatorAvatarUrl : author?.avatarUrl}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                          <p className="text-sm font-semibold">{authorLabel(p.authorId)}</p>
                          {isCoordinator && <Chip tone="accent" className="text-[0.65rem]">ATL</Chip>}
                          <span className="text-xs text-muted-foreground">{p.time}</span>
                        </div>
                        <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">{p.text}</p>
                      </div>
                    </li>
                  );
                })}
                {posts.length === 0 && (
                  <li className="py-8 text-center text-sm text-muted-foreground">
                    No updates yet — coordinators will post announcements here.
                  </li>
                )}
              </ul>
            </section>

            <section className="surface p-6">
              <SectionHeading title="Recent activity" subtitle="What's happening in this community" />
              <ul className="mt-4 space-y-3">
                {community.activity.map((a, i) => (
                  <li key={`${i}-${a}`} className="flex gap-2 text-sm text-foreground/85">
                    <Megaphone className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    {a}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <aside className="space-y-4 xl:sticky xl:top-8 xl:self-start">
            <div className="surface p-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                <CalendarDays className="h-4 w-4" /> Upcoming sessions
              </h2>
              <ul className="mt-4 space-y-4">
                {community.sessions.map((s) => (
                  <li key={s.title} className="rounded-xl border border-border p-3">
                    <p className="font-medium">{s.title}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CalendarDays className="h-3 w-3" /> {s.when}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {s.place}
                    </p>
                  </li>
                ))}
                {community.sessions.length === 0 && (
                  <li className="text-sm text-muted-foreground">No sessions scheduled.</li>
                )}
              </ul>
            </div>

            <div className="surface p-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                <BookOpen className="h-4 w-4" /> Resources
              </h2>
              <ul className="mt-4 space-y-3">
                {community.resources.map((r) => (
                  <li key={r.label} className="rounded-xl bg-secondary/50 px-3 py-2.5">
                    <p className="text-sm font-medium">{r.label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{r.note}</p>
                  </li>
                ))}
                {community.resources.length === 0 && (
                  <li className="text-sm text-muted-foreground">No resources listed.</li>
                )}
              </ul>
            </div>
          </aside>
        </TabsContent>

        <TabsContent value="members" className="mt-6">
          <SectionHeading title="Members" subtitle="Students in this community — connect and collaborate" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search members by name, skill or interest..."
            className="mb-4 mt-4 max-w-md"
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMembers.map((s) => (
              <StudentCard key={s.id} student={s} />
            ))}
            {filteredMembers.length === 0 && (
              <p className="surface col-span-full p-8 text-center text-sm text-muted-foreground">
                {search ? "No members match your search." : "No members listed yet."}
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
      )}
    </>
  );
}
