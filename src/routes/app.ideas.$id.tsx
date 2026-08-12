import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Heart, MessageSquare, Rocket, Send } from "lucide-react";
import { useState } from "react";
import { ReportDialog } from "@/components/ReportDialog";
import { Avatar, Chip } from "@/components/ui-kit/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppState } from "@/lib/app-state";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/ideas/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Idea — ${params.id} — AAVISHKAR` },
      { name: "description", content: "A student idea on the AAVISHKAR Idea Hub." },
    ],
  }),
  component: IdeaDetail,
});

function IdeaDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { allIdeas, supported, toggleSupport, joinedIdeas, joinIdea, addComment, addProject, findStudent } =
    useAppState();
  const [comment, setComment] = useState("");

  const idea = allIdeas.find((i) => i.id === id);
  if (!idea) {
    return (
      <div className="surface p-10 text-center">
        <p className="font-medium">That idea isn't here.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/app/ideas">Back to Idea Hub</Link>
        </Button>
      </div>
    );
  }

  const creator = findStudent(idea.creatorId);
  const isSupported = supported.includes(idea.id);
  const joined = joinedIdeas.includes(idea.id);

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="mb-6 gap-1.5">
        <Link to="/app/ideas">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Idea Hub
        </Link>
      </Button>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <div className="surface p-6 sm:p-8">
            <Chip tone="accent">{idea.category}</Chip>
            {idea.reviewStatus === "pending" && <Chip tone="warning">Under review</Chip>}
            <div className="mt-2 flex justify-end">
              <ReportDialog target={`Idea — “${idea.title}”`} defaultKind="Idea" />
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight">{idea.title}</h1>
            <div className="mt-4 flex items-center gap-3">
              <Avatar initials={creator?.initials ?? "AA"} accent={creator?.accent} size="sm" />
              <div>
                <p className="text-sm font-medium">{creator?.name}</p>
                <p className="text-xs text-muted-foreground">{creator?.className}</p>
              </div>
            </div>

            <div className="mt-8 space-y-6">
              {[
                { label: "Problem", body: idea.problem },
                { label: "Proposed solution", body: idea.solution },
                { label: "Why it matters", body: idea.why },
              ].map((s) => (
                <div key={s.label}>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {s.label}
                  </h2>
                  <p className="mt-2 leading-relaxed text-foreground/85">{s.body}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Required skills
                </h2>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {idea.lookingFor.map((s) => (
                    <Chip key={s} tone="accent">
                      {s}
                    </Chip>
                  ))}
                </div>
              </div>
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Technologies
                </h2>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {idea.technologies.length ? (
                    idea.technologies.map((s) => <Chip key={s}>{s}</Chip>)
                  ) : (
                    <p className="text-sm text-muted-foreground">Not decided yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="surface p-6">
            <h2 className="flex items-center gap-2 font-semibold">
              <MessageSquare className="h-4 w-4 text-accent" /> Comments ({idea.comments.length})
            </h2>
            <ul className="mt-5 space-y-4">
              {idea.comments.map((c) => {
                const author = findStudent(c.authorId);
                return (
                  <li key={c.id} className="flex gap-3">
                    <Avatar initials={author?.initials ?? "?"} accent={author?.accent} size="sm" />
                    <div className="min-w-0 flex-1 rounded-xl bg-secondary/70 px-4 py-3">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="truncate text-sm font-semibold">{author?.name}</p>
                        <span className="shrink-0 text-xs text-muted-foreground">{c.time}</span>
                      </div>
                      <p className="mt-1 text-sm text-foreground/85">{c.text}</p>
                    </div>
                  </li>
                );
              })}
              {idea.comments.length === 0 && (
                <li className="text-sm text-muted-foreground">No comments yet — start the discussion.</li>
              )}
            </ul>

            <form
              className="mt-5 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!comment.trim()) return;
                addComment(idea.id, comment.trim());
                setComment("");
              }}
            >
              <Input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="h-11"
              />
              <Button type="submit" size="icon" className="h-11 w-11" disabled={!comment.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-8 lg:self-start">
          <div className="surface space-y-3 p-5">
            <Button
              className="w-full"
              variant={joined ? "secondary" : "default"}
              disabled={joined}
              onClick={() => joinIdea(idea.id, idea.title)}
            >
              {joined ? "You joined this idea" : "Join Idea"}
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/app/messages">Message Creator</Link>
            </Button>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => {
                addProject({
                  title: idea.title,
                  description: idea.solution,
                  deadline: "Not set",
                });
                navigate({ to: "/app/projects" });
              }}
            >
              <Rocket className="h-4 w-4" /> Turn Into Project
            </Button>
            <button
              onClick={() => toggleSupport(idea.id)}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-sm font-medium transition-colors hover:border-accent/50",
                isSupported && "border-accent/50 bg-accent/10 text-primary",
              )}
            >
              <Heart className={cn("h-4 w-4", isSupported && "fill-current")} />
              {idea.supports} supports
            </button>
          </div>

          <div className="surface p-5">
            <h2 className="text-sm font-semibold">Interested students</h2>
            <ul className="mt-4 space-y-3">
              {idea.interested.map((sid) => {
                const s = findStudent(sid);
                if (!s) return null;
                return (
                  <li key={sid} className="rounded-lg border border-border p-3">
                    <Link
                      to="/app/people/$id"
                      params={{ id: sid }}
                      className="flex items-center gap-3 transition-colors hover:opacity-90"
                    >
                      <Avatar initials={s.initials} accent={s.accent} size="sm" src={s.avatarUrl} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{s.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{s.skills.slice(0, 2).join(" · ")}</p>
                      </div>
                    </Link>
                  </li>
                );
              })}
              {idea.interested.length === 0 && (
                <li className="text-sm text-muted-foreground">Nobody yet. Be first.</li>
              )}
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}
