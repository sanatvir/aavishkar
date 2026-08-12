import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, CalendarDays, Megaphone, Send, ShieldCheck, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Avatar, Chip, PageHeader, SectionHeading } from "@/components/ui-kit/primitives";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAppState } from "@/lib/app-state";
import { COORDINATOR_AUTHOR_ID } from "@/lib/session";

export const Route = createFileRoute("/admin/communities/$id")({
  head: ({ params }) => ({
    meta: [{ title: `Manage community — ${params.id} — AAVISHKAR Admin` }],
  }),
  component: AdminCommunityDetail,
});

function AdminCommunityDetail() {
  const { id } = Route.useParams();
  const {
    communities,
    getCommunityMemberIds,
    findStudent,
    communityPosts,
    communityJoinApplications,
    postToCommunity,
    setCommunityJoinApplicationStatus,
    platformSettings,
  } = useAppState();
  const [postText, setPostText] = useState("");

  const community = communities.find((c) => c.id === id);
  const memberIds = getCommunityMemberIds(id);
  const members = useMemo(
    () => memberIds.map((sid) => findStudent(sid)).filter(Boolean),
    [memberIds, findStudent],
  );
  const posts = useMemo(
    () => communityPosts.filter((p) => p.communityId === id),
    [communityPosts, id],
  );
  const pendingApplications = useMemo(
    () => communityJoinApplications.filter((a) => a.communityId === id && a.status === "Pending"),
    [communityJoinApplications, id],
  );

  const authorLabel = (authorId: string) =>
    authorId === COORDINATOR_AUTHOR_ID ? platformSettings.coordinatorName : findStudent(authorId)?.name ?? "Coordinator";

  if (!community) {
    return (
      <div className="surface p-10 text-center">
        <p className="font-medium">That community isn&apos;t here.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/admin/communities">Back to Communities</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="mb-6 gap-1.5">
        <Link to="/admin/communities">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Communities
        </Link>
      </Button>

      <PageHeader title={community.name} subtitle={community.description} />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Avatar initials={community.name.slice(0, 2).toUpperCase()} accent={community.accent} size="lg" />
        <Chip tone="accent">
          <Users className="h-3 w-3" /> {members.length || community.members} members
        </Chip>
        <Chip tone="success">
          <ShieldCheck className="h-3 w-3" /> Coordinator-managed feed
        </Chip>
        {pendingApplications.length > 0 && (
          <Chip tone="accent">{pendingApplications.length} pending application{pendingApplications.length === 1 ? "" : "s"}</Chip>
        )}
      </div>

      {pendingApplications.length > 0 && (
        <section className="surface mb-6 p-6">
          <SectionHeading
            title="Join applications"
            subtitle="Review students who want to join this community"
          />
          <ul className="mt-4 space-y-3">
            {pendingApplications.map((a) => {
              const student = findStudent(a.studentId);
              return (
                <li key={a.id} className="rounded-xl border border-border p-4">
                  <div className="flex items-center gap-3">
                    <Avatar
                      initials={student?.initials ?? "?"}
                      accent={student?.accent}
                      size="sm"
                      src={student?.avatarUrl}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{student?.name ?? "Student"}</p>
                      <p className="text-xs text-muted-foreground">
                        {student?.className} · submitted {a.submitted}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-foreground/80">{a.note}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => setCommunityJoinApplicationStatus(a.id, "Accepted")}>
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setCommunityJoinApplicationStatus(a.id, "Rejected")}
                    >
                      Reject
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <section className="surface p-6">
          <SectionHeading title="Post to community feed" subtitle="Official updates visible to all students in this community" />
          <form
            className="mt-4 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!postText.trim()) return;
              postToCommunity(id, postText);
              setPostText("");
            }}
          >
            <Textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder="Announce a session, share resources, or remind members about deadlines..."
              rows={4}
            />
            <Button type="submit" size="sm" className="gap-2" disabled={!postText.trim()}>
              <Send className="h-3.5 w-3.5" /> Publish update
            </Button>
          </form>

          <ul className="mt-8 space-y-4">
            {posts.map((p) => (
              <li key={p.id} className="flex gap-3 rounded-xl border border-border bg-accent/5 p-4">
                <Avatar initials={platformSettings.coordinatorName.slice(0, 2).toUpperCase()} accent={community.accent} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <p className="text-sm font-semibold">{authorLabel(p.authorId)}</p>
                    <Chip tone="accent" className="text-[0.65rem]">ATL</Chip>
                    <span className="text-xs text-muted-foreground">{p.time}</span>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed">{p.text}</p>
                </div>
              </li>
            ))}
            {posts.length === 0 && (
              <li className="py-8 text-center text-sm text-muted-foreground">No posts yet — publish the first update above.</li>
            )}
          </ul>
        </section>

        <aside className="space-y-4">
          <div className="surface p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Members ({members.length})</h2>
            <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto">
              {members.map((s) =>
                s ? (
                  <li key={s.id} className="flex items-center gap-2 text-sm">
                    <Avatar initials={s.initials} accent={s.accent} size="xs" src={s.avatarUrl} />
                    <span className="truncate">{s.name}</span>
                  </li>
                ) : null,
              )}
              {members.length === 0 && (
                <li className="text-sm text-muted-foreground">No members yet.</li>
              )}
            </ul>
          </div>

          <div className="surface p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <CalendarDays className="h-4 w-4" /> Sessions
            </h2>
            <ul className="mt-4 space-y-3">
              {community.sessions.map((s) => (
                <li key={s.title} className="rounded-xl border border-border p-3 text-sm">
                  <p className="font-medium">{s.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{s.when}</p>
                  <p className="text-xs text-muted-foreground">{s.place}</p>
                </li>
              ))}
              {community.sessions.length === 0 && (
                <li className="text-sm text-muted-foreground">No sessions listed.</li>
              )}
            </ul>
          </div>

          <div className="surface p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <BookOpen className="h-4 w-4" /> Resources
            </h2>
            <ul className="mt-4 space-y-2">
              {community.resources.map((r) => (
                <li key={r.label} className="rounded-lg bg-secondary/50 px-3 py-2 text-sm">
                  <p className="font-medium">{r.label}</p>
                  <p className="text-xs text-muted-foreground">{r.note}</p>
                </li>
              ))}
              {community.resources.length === 0 && (
                <li className="text-sm text-muted-foreground">No resources yet.</li>
              )}
            </ul>
          </div>

          <div className="surface p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <Megaphone className="h-4 w-4" /> Activity log
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {community.activity.map((a, i) => (
                <li key={`${i}-${a}`}>· {a}</li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}
