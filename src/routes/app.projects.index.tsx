import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { ProjectCard } from "@/components/cards";
import { PageHeader, SectionHeading } from "@/components/ui-kit/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppState } from "@/lib/app-state";

export const Route = createFileRoute("/app/projects/")({
  head: () => ({
    meta: [
      { title: "My Projects — AAVISHKAR" },
      { name: "description", content: "Track your APSDK innovation projects, teams and progress." },
      { property: "og:title", content: "My Projects — AAVISHKAR" },
      { property: "og:description", content: "Teams, milestones and progress in one workspace." },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const { projects, addProject } = useAppState();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ title: "", description: "", deadline: "" });

  const mine = projects.filter((p) => p.mine);
  const others = projects.filter((p) => !p.mine);

  return (
    <>
      <PageHeader
        title="My Projects"
        subtitle="Everything you're building, with the team and the progress."
        action={
          <Button className="gap-2" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Create Project
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {mine.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </div>

      {others.length > 0 && (
        <section className="mt-12">
          <SectionHeading title="Open to join" subtitle="Projects across the school looking for people" />
          <div className="grid gap-4 lg:grid-cols-2">
            {others.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </section>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Project</DialogTitle>
            <DialogDescription>
              Projects get a workspace with tasks, files, updates and team chat.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="p-title">Project title</Label>
              <Input
                id="p-title"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder="Smart Library Shelf"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-desc">Description</Label>
              <Textarea
                id="p-desc"
                rows={3}
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                placeholder="What are you building and for whom?"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-deadline">Target deadline</Label>
              <Input
                id="p-deadline"
                value={draft.deadline}
                onChange={(e) => setDraft({ ...draft, deadline: e.target.value })}
                placeholder="30 September"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!draft.title.trim()}
              onClick={() => {
                addProject(draft);
                setDraft({ title: "", description: "", deadline: "" });
                setOpen(false);
              }}
            >
              Create project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
