import { Link } from "@tanstack/react-router";
import { Heart, MessageSquare, Users } from "lucide-react";
import { Avatar, Chip, ProgressBar } from "@/components/ui-kit/primitives";
import { useAppState } from "@/lib/app-state";
import { type Idea, type Project, type Student } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function StudentCard({ student, reason }: { student: Student; reason?: string | undefined }) {
  const { isConnected, toggleConnection } = useAppState();
  const connected = isConnected(student.id);

  return (
    <article className="surface lift flex h-full flex-col gap-4 p-5">
      <div className="flex min-w-0 items-start gap-3">
        <Avatar
          initials={student.initials}
          accent={student.accent}
          name={student.name}
          src={student.avatarUrl}
        />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold">{student.name}</h3>
          <p className="text-sm text-muted-foreground">{student.className}</p>
        </div>
        <Chip tone={student.availability === "Available" ? "success" : "neutral"}>
          {student.availability}
        </Chip>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {student.skills.slice(0, 4).map((s) => (
          <Chip key={s} tone="accent">
            {s}
          </Chip>
        ))}
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">“{student.bio}”</p>

      {reason && (
        <p className="rounded-lg border border-accent/25 bg-accent/8 px-3 py-2 text-xs text-primary">
          {reason}
        </p>
      )}

      <div className="mt-auto flex gap-2 pt-1">
        <Button asChild variant="outline" size="sm" className="flex-1">
          <Link to="/app/people/$id" params={{ id: student.id }}>
            View Profile
          </Link>
        </Button>
        <Button
          size="sm"
          variant={connected ? "secondary" : "default"}
          className="flex-1"
          onClick={() => toggleConnection(student.id)}
        >
          {connected ? "Connected" : "Connect"}
        </Button>
      </div>
    </article>
  );
}

export function IdeaCard({ idea }: { idea: Idea }) {
  const { supported, toggleSupport, joinedIdeas, joinIdea, findStudent } = useAppState();
  const creator = findStudent(idea.creatorId);
  const isSupported = supported.includes(idea.id);
  const joined = joinedIdeas.includes(idea.id);

  return (
    <article className="surface lift flex h-full flex-col gap-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 text-lg font-semibold leading-snug">{idea.title}</h3>
        <Chip tone="accent">{idea.category}</Chip>
      </div>

      <dl className="space-y-2.5 text-sm">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Problem</dt>
          <dd className="mt-0.5 text-foreground/80">{idea.problem}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Solution</dt>
          <dd className="mt-0.5 text-foreground/80">{idea.solution}</dd>
        </div>
      </dl>

      {idea.lookingFor.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Looking for
          </p>
          <div className="flex flex-wrap gap-1.5">
            {idea.lookingFor.map((s) => (
              <Chip key={s}>{s}</Chip>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 border-t border-border pt-3 text-sm">
        <Avatar
          initials={creator?.initials ?? "AA"}
          accent={creator?.accent}
          size="xs"
          src={creator?.avatarUrl}
        />
        <span className="min-w-0 truncate text-muted-foreground">{creator?.name}</span>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <button
          onClick={() => toggleSupport(idea.id)}
          className={cn(
            "inline-flex items-center gap-1.5 transition-colors hover:text-primary",
            isSupported && "text-primary",
          )}
        >
          <Heart className={cn("h-3.5 w-3.5", isSupported && "fill-current")} />
          {idea.supports}
        </button>
        <span className="inline-flex items-center gap-1.5">
          <MessageSquare className="h-3.5 w-3.5" />
          {idea.comments.length}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" />
          {idea.collaborators}
        </span>
      </div>

      <div className="mt-auto flex gap-2">
        <Button asChild size="sm" variant="outline" className="flex-1">
          <Link to="/app/ideas/$id" params={{ id: idea.id }}>
            View Idea
          </Link>
        </Button>
        <Button
          size="sm"
          className="flex-1"
          variant={joined ? "secondary" : "default"}
          disabled={joined}
          onClick={() => joinIdea(idea.id, idea.title)}
        >
          {joined ? "Joined" : "Join"}
        </Button>
      </div>
    </article>
  );
}

export function ProjectCard({ project }: { project: Project }) {
  const { findStudent } = useAppState();

  return (
    <Link
      to="/app/projects/$id"
      params={{ id: project.id }}
      className="surface lift block p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 text-lg font-semibold">{project.title}</h3>
        <Chip tone={project.status === "Active" ? "success" : "neutral"}>{project.status}</Chip>
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{project.description}</p>

      <div className="mt-4 flex items-center gap-3">
        <div className="flex -space-x-2">
          {project.memberIds.slice(0, 4).map((id) => {
            const s = findStudent(id);
            return <Avatar key={id} initials={s?.initials ?? "?"} accent={s?.accent} size="xs" />;
          })}
        </div>
        <span className="text-xs text-muted-foreground">{project.memberIds.length} members</span>
      </div>

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-semibold">{project.progress}%</span>
        </div>
        <ProgressBar value={project.progress} />
      </div>
    </Link>
  );
}
