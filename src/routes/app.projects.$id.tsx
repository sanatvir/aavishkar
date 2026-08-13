import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays, Circle, CircleDot, Download, Send } from "lucide-react";
import { useState } from "react";
import { Avatar, Chip, ProgressBar } from "@/components/ui-kit/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppState } from "@/lib/app-state";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/projects/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Project — ${params.id} — AAVISHKAR` },
      { name: "description", content: "A student project workspace on AAVISHKAR." },
    ],
  }),
  component: Workspace,
});

function Workspace() {
  const { id } = Route.useParams();
  const { projects, toggleTask, sendProjectChat, postProjectUpdate, inviteToProject, findStudent, currentUser, addProjectFile, isConnected, toggleConnection, connections, students } =
    useAppState();
  const [message, setMessage] = useState("");
  const [updateText, setUpdateText] = useState("");

  const project = projects.find((p) => p.id === id);
  if (!project) {
    return (
      <div className="surface p-10 text-center">
        <p className="font-medium">That project isn't here.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/app/projects">Back to Projects</Link>
        </Button>
      </div>
    );
  }

  const messages = project.chat;

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="mb-6 gap-1.5">
        <Link to="/app/projects">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Projects
        </Link>
      </Button>

      <header className="surface grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 p-6 sm:flex sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold tracking-tight">{project.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Chip tone={project.status === "Active" ? "success" : "neutral"}>Status: {project.status}</Chip>
            <Chip>
              <CalendarDays className="h-3 w-3" /> {project.deadline}
            </Chip>
          </div>
        </div>
        <div className="flex -space-x-2">
          {project.memberIds.map((m) => {
            const s = findStudent(m);
            return <Avatar key={m} initials={s?.initials ?? "?"} accent={s?.accent} name={s?.name} size="sm" />;
          })}
        </div>
      </header>

      <Tabs defaultValue="overview" className="mt-6">
        <TabsList className="flex w-full flex-wrap justify-start">
          {["Overview", "Tasks", "Files", "Updates", "Team", "Chat"].map((t) => (
            <TabsTrigger key={t} value={t.toLowerCase()}>
              {t}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="surface p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Description
            </h2>
            <p className="mt-3 leading-relaxed text-foreground/85">{project.description}</p>
            <h2 className="mt-8 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Milestones
            </h2>
            <ol className="mt-4 space-y-3">
              {project.milestones.map((m) => (
                <li key={m.label} className="flex items-center gap-3 text-sm">
                  {m.done ? (
                    <CircleDot className="h-4 w-4 shrink-0 text-success" />
                  ) : (
                    <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <span className={cn("flex-1", m.done && "text-muted-foreground line-through")}>
                    {m.label}
                  </span>
                  <span className="text-xs text-muted-foreground">{m.date}</span>
                </li>
              ))}
              {project.milestones.length === 0 && (
                <li className="text-sm text-muted-foreground">No milestones yet.</li>
              )}
            </ol>
          </div>
          <div className="surface p-6">
            <p className="text-sm text-muted-foreground">Progress</p>
            <p className="mt-1 text-4xl font-bold">{project.progress}%</p>
            <ProgressBar value={project.progress} className="mt-3" />
            <p className="mt-6 text-sm text-muted-foreground">Deadline</p>
            <p className="font-semibold">{project.deadline}</p>
            <p className="mt-6 text-sm text-muted-foreground">Team</p>
            <p className="font-semibold">{project.memberIds.length} members</p>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="mt-6">
          <div className="surface divide-y divide-border p-2">
            {project.tasks.map((t) => (
              <button
                key={t.id}
                onClick={() => toggleTask(project.id, t.id)}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-secondary/60"
              >
                <span
                  className={cn(
                    "grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[0.6rem] font-bold transition-colors",
                    t.done
                      ? "border-success bg-success text-success-foreground"
                      : t.inProgress
                        ? "border-accent text-accent"
                        : "border-border text-transparent",
                  )}
                >
                  ✓
                </span>
                <span className={cn("flex-1 text-sm", t.done && "text-muted-foreground line-through")}>
                  {t.title}
                </span>
                {!t.done && t.inProgress && <Chip tone="accent">In progress</Chip>}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Tap a task to toggle completion — progress updates instantly.
          </p>
        </TabsContent>

        <TabsContent value="files" className="mt-6">
          <div className="surface divide-y divide-border">
            {project.files.map((f) => (
              <div key={`${f.name}-${f.date}`} className="flex items-center gap-4 px-5 py-4">
                <div className="min-w-0 flex-1">
                  {f.url ? (
                    <a href={f.url} target="_blank" rel="noreferrer" className="truncate text-sm font-medium hover:underline">
                      {f.name}
                    </a>
                  ) : (
                    <p className="truncate text-sm font-medium">{f.name}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {f.size} · {f.by} · {f.date}
                  </p>
                </div>
                <Download className="h-4 w-4 shrink-0 text-muted-foreground" />
              </div>
            ))}
            {project.files.length === 0 && (
              <p className="px-5 py-10 text-center text-sm text-muted-foreground">No files yet.</p>
            )}
          </div>
          {project.memberIds.includes(currentUser.id) && (
            <div className="mt-4">
              <Input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) addProjectFile(project.id, file);
                  e.target.value = "";
                }}
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Uploads use Supabase Storage when the project-files bucket is configured.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="updates" className="mt-6 space-y-3">
          {project.memberIds.includes(currentUser.id) && (
            <form
              className="surface flex gap-2 p-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (!updateText.trim()) return;
                postProjectUpdate(project.id, updateText);
                setUpdateText("");
              }}
            >
              <Input
                value={updateText}
                onChange={(e) => setUpdateText(e.target.value)}
                placeholder="Share a progress update with your team..."
                className="h-11"
              />
              <Button type="submit" disabled={!updateText.trim()}>
                Post
              </Button>
            </form>
          )}
          {project.updates.map((u, i) => {
            const s = findStudent(u.authorId);
            return (
              <div key={i} className="surface flex gap-3 p-5">
                <Avatar initials={s?.initials ?? "?"} accent={s?.accent} size="sm" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold">
                    {s?.name} <span className="font-normal text-muted-foreground">· {u.time}</span>
                  </p>
                  <p className="mt-1 text-sm text-foreground/85">{u.text}</p>
                </div>
              </div>
            );
          })}
          {project.updates.length === 0 && (
            <p className="surface p-10 text-center text-sm text-muted-foreground">No updates yet.</p>
          )}
        </TabsContent>

        <TabsContent value="team" className="mt-6 space-y-4">
          {project.memberIds.includes(currentUser.id) && (
            <div className="surface p-5">
              <p className="text-sm font-semibold">Invite a teammate</p>
              <p className="mt-1 text-xs text-muted-foreground">Pick from your connections who are not already on this project.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {connections
                  .filter((id) => !project.memberIds.includes(id))
                  .map((id) => {
                    const s = students.find((st) => st.id === id);
                    if (!s) return null;
                    return (
                      <Button key={id} size="sm" variant="outline" onClick={() => inviteToProject(project.id, id)}>
                        Invite {s.name.split(" ")[0]}
                      </Button>
                    );
                  })}
                {connections.filter((id) => !project.memberIds.includes(id)).length === 0 && (
                  <p className="text-sm text-muted-foreground">Connect with students in People to invite them here.</p>
                )}
              </div>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
          {project.memberIds.map((m) => {
            const s = findStudent(m);
            if (!s) return null;
            const connected = isConnected(m);
            const isMe = m === currentUser.id;
            return (
              <div key={m} className="surface lift flex flex-col gap-4 p-5">
                <Link to="/app/people/$id" params={{ id: m }} className="flex items-center gap-4">
                  <Avatar initials={s.initials} accent={s.accent} src={s.avatarUrl} />
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{s.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{s.className}</p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">{s.skills.slice(0, 3).join(" · ")}</p>
                  </div>
                </Link>
                {!isMe && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={connected ? "secondary" : "default"}
                      className="flex-1"
                      onClick={() => toggleConnection(m)}
                    >
                      {connected ? "Connected" : "Connect"}
                    </Button>
                    <Button asChild size="sm" variant="outline" className="flex-1">
                      <Link to="/app/people/$id" params={{ id: m }}>
                        View profile
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
          </div>
        </TabsContent>

        <TabsContent value="chat" className="mt-6">
          <div className="surface flex h-[460px] flex-col">
            <div className="flex-1 space-y-3 overflow-y-auto p-5">
              {messages.map((m, i) => {
                const s = findStudent(m.authorId);
                const mine = m.authorId === currentUser.id;
                return (
                  <div key={i} className={cn("flex gap-2.5", mine && "flex-row-reverse")}>
                    <Avatar initials={s?.initials ?? "?"} accent={s?.accent} size="xs" />
                    <div
                      className={cn(
                        "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm",
                        mine ? "bg-primary text-primary-foreground" : "bg-secondary",
                      )}
                    >
                      {m.text}
                      <span className={cn("mt-1 block text-[0.65rem]", mine ? "text-primary-foreground/70" : "text-muted-foreground")}>
                        {m.time}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <form
              className="flex gap-2 border-t border-border p-4"
              onSubmit={(e) => {
                e.preventDefault();
                const text = message.trim();
                if (!text) return;
                sendProjectChat(project.id, text);
                setMessage("");
              }}
            >
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Message the team..."
                className="h-11"
              />
              <Button type="submit" size="icon" className="h-11 w-11" disabled={!message.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
