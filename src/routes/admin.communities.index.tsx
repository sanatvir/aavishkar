import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, Plus, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { Avatar, Chip, PageHeader } from "@/components/ui-kit/primitives";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAppState } from "@/lib/app-state";

export const Route = createFileRoute("/admin/communities/")({
  head: () => ({
    meta: [
      { title: "Communities — AAVISHKAR Admin" },
      { name: "description", content: "Create and manage APSDK student communities." },
    ],
  }),
  component: AdminCommunities,
});

function AdminCommunities() {
  const { communities, getCommunityMemberIds, findStudent, addCommunity, removeCommunity, communityPosts, communityJoinApplications } =
    useAppState();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({
    name: "",
    description: "",
    sessionTitle: "",
    sessionWhen: "",
    sessionPlace: "ATL Lab",
  });

  const publish = () => {
    if (!draft.name.trim() || !draft.description.trim()) return;
    addCommunity(draft);
    setDraft({
      name: "",
      description: "",
      sessionTitle: "",
      sessionWhen: "",
      sessionPlace: "ATL Lab",
    });
    setOpen(false);
  };

  return (
    <>
      <PageHeader
        title="Communities"
        subtitle="Create communities and post official updates to member feeds."
        action={
          <Button className="gap-2" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> New community
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {communities.map((c) => {
          const memberIds = getCommunityMemberIds(c.id);
          const members = memberIds.map((id) => findStudent(id)).filter(Boolean);
          const postCount = communityPosts.filter((p) => p.communityId === c.id).length;
          const pendingCount = communityJoinApplications.filter(
            (a) => a.communityId === c.id && a.status === "Pending",
          ).length;

          return (
            <article key={c.id} className="surface flex h-full flex-col gap-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold">{c.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
                </div>
                <Button size="icon" variant="ghost" onClick={() => removeCommunity(c.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                <Chip tone="accent">
                  <Users className="h-3 w-3" /> {memberIds.length || c.members} members
                </Chip>
                <Chip tone="neutral">{postCount} feed posts</Chip>
                {pendingCount > 0 && (
                  <Chip tone="accent">{pendingCount} pending</Chip>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Members</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {members.slice(0, 5).map((s) =>
                    s ? (
                      <span
                        key={s.id}
                        className="flex items-center gap-2 rounded-lg border border-border px-2 py-1.5 text-xs"
                      >
                        <Avatar initials={s.initials} accent={s.accent} size="xs" src={s.avatarUrl} />
                        <span className="max-w-[7rem] truncate font-medium">{s.name}</span>
                      </span>
                    ) : null,
                  )}
                  {members.length > 5 && (
                    <span className="self-center text-xs text-muted-foreground">+{members.length - 5} more</span>
                  )}
                </div>
              </div>

              {c.sessions[0] && (
                <p className="flex items-center gap-1.5 text-xs text-foreground/80">
                  <CalendarDays className="h-3.5 w-3.5 text-accent" />
                  {c.sessions[0].title} — {c.sessions[0].when}
                </p>
              )}

              <Button asChild size="sm" variant="outline" className="mt-auto gap-1.5">
                <Link to="/admin/communities/$id" params={{ id: c.id }}>
                  Manage & post updates <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </article>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create community</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="e.g. AI & Machine Learning"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                rows={3}
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                placeholder="What is this community about?"
              />
            </div>
            <div className="space-y-1.5">
              <Label>First session title (optional)</Label>
              <Input
                value={draft.sessionTitle}
                onChange={(e) => setDraft({ ...draft, sessionTitle: e.target.value })}
                placeholder="e.g. Weekly meetup"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>When</Label>
                <Input
                  value={draft.sessionWhen}
                  onChange={(e) => setDraft({ ...draft, sessionWhen: e.target.value })}
                  placeholder="Thursday · 3 PM"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Place</Label>
                <Input
                  value={draft.sessionPlace}
                  onChange={(e) => setDraft({ ...draft, sessionPlace: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={publish} disabled={!draft.name.trim() || !draft.description.trim()}>
              Create community
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
