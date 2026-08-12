import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
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

export const Route = createFileRoute("/admin/opportunities")({
  component: AdminOpportunities,
});

function AdminOpportunities() {
  const { opportunities, addOpportunity, removeOpportunity } = useAppState();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({
    title: "",
    type: "Competition",
    deadline: "",
    description: "",
    eligibility: "Classes IX–XII",
    skills: "",
    organizer: "ATL • APSDK",
  });

  const publish = () => {
    if (!draft.title.trim()) return;
    addOpportunity(draft);
    setOpen(false);
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
              <Button size="icon" variant="ghost" onClick={() => removeOpportunity(o.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
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
                <Input
                  value={draft[key]}
                  onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                />
              </div>
            ))}
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                rows={3}
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={publish}>Publish</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
