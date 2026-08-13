import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Chip, PageHeader } from "@/components/ui-kit/primitives";
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
import type { Opportunity } from "@/lib/types";

export const Route = createFileRoute("/admin/opportunities")({
  component: AdminOpportunities,
});

const emptyDraft = () => ({
  title: "",
  type: "Competition",
  deadline: "",
  description: "",
  eligibility: "Classes IX–XII",
  skills: "",
  organizer: "ATL • APSDK",
});

function AdminOpportunities() {
  const { opportunities, addOpportunity, saveOpportunity, removeOpportunity } = useAppState();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [editDraft, setEditDraft] = useState<Opportunity | null>(null);

  const publish = () => {
    if (!draft.title.trim()) return;
    addOpportunity(draft);
    setOpen(false);
    setDraft(emptyDraft());
  };

  return (
    <>
      <PageHeader
        title="Opportunities"
        subtitle="Competitions, workshops and ATL events visible to students."
        action={
          <Button className="gap-2" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> New opportunity
          </Button>
        }
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {opportunities.map((o) => (
          <article key={o.id} className="surface flex flex-col gap-3 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2">
                <Chip tone="accent">{o.type}</Chip>
                <Chip tone="neutral">Deadline {o.deadline}</Chip>
              </div>
              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setEditDraft(o);
                    setEditOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => removeOpportunity(o.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <h3 className="text-lg font-semibold">{o.title}</h3>
            <p className="text-sm text-muted-foreground">{o.description}</p>
            <p className="text-xs text-muted-foreground">{o.organizer}</p>
          </article>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Publish opportunity</DialogTitle>
          </DialogHeader>
          <OpportunityForm draft={draft} onChange={setDraft} />
          <DialogFooter>
            <Button onClick={publish}>Publish</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit opportunity</DialogTitle>
          </DialogHeader>
          {editDraft && (
            <>
              <OpportunityForm
                draft={{
                  title: editDraft.title,
                  type: editDraft.type,
                  deadline: editDraft.deadline,
                  description: editDraft.description,
                  eligibility: editDraft.eligibility,
                  skills: editDraft.skills.join(", "),
                  organizer: editDraft.organizer,
                }}
                onChange={(next) =>
                  setEditDraft({
                    ...editDraft,
                    title: next.title,
                    type: next.type,
                    deadline: next.deadline,
                    description: next.description,
                    eligibility: next.eligibility,
                    skills: next.skills
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                    organizer: next.organizer,
                  })
                }
              />
              <DialogFooter>
                <Button
                  onClick={() => {
                    if (!editDraft) return;
                    saveOpportunity(editDraft);
                    setEditOpen(false);
                  }}
                >
                  Save changes
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function OpportunityForm({
  draft,
  onChange,
}: {
  draft: ReturnType<typeof emptyDraft>;
  onChange: (draft: ReturnType<typeof emptyDraft>) => void;
}) {
  return (
    <div className="grid gap-3">
      {(
        [
          ["title", "Title"],
          ["type", "Type"],
          ["deadline", "Deadline"],
          ["organizer", "Organizer"],
          ["eligibility", "Eligibility"],
          ["skills", "Skills (comma-separated)"],
        ] as const
      ).map(([key, label]) => (
        <div key={key} className="space-y-1.5">
          <Label>{label}</Label>
          <Input value={draft[key]} onChange={(e) => onChange({ ...draft, [key]: e.target.value })} />
        </div>
      ))}
      <div className="space-y-1.5">
        <Label>Description</Label>
        <Textarea rows={3} value={draft.description} onChange={(e) => onChange({ ...draft, description: e.target.value })} />
      </div>
    </div>
  );
}
