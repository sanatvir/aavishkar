import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, MapPin, Plus, Trash2 } from "lucide-react";
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
import { useAppState } from "@/lib/app-state";

export const Route = createFileRoute("/admin/events")({
  component: AdminEvents,
});

function AdminEvents() {
  const { events, addEvent, removeEvent } = useAppState();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ title: "", date: "", place: "", seatsTotal: "" });

  const publish = () => {
    if (!draft.title.trim()) return;
    addEvent(draft);
    setOpen(false);
    setDraft({ title: "", date: "", place: "", seatsTotal: "" });
  };

  return (
    <>
      <PageHeader
        title="Events"
        subtitle="Briefings, workshops and exhibition logistics."
        action={
          <Button className="gap-2" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Add event
          </Button>
        }
      />
      <div className="grid gap-3 lg:grid-cols-2">
        {events.map((e) => (
          <div key={e.id} className="surface p-5">
            <div className="flex items-start justify-between gap-3">
              <h3 className="min-w-0 font-semibold">{e.title}</h3>
              <div className="flex items-center gap-2">
                <Chip tone="accent">{e.seats}</Chip>
                <Button size="icon" variant="ghost" onClick={() => removeEvent(e.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" /> {e.date}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" /> {e.place}
            </p>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New event</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} placeholder="21 August" />
            </div>
            <div className="space-y-1.5">
              <Label>Place</Label>
              <Input value={draft.place} onChange={(e) => setDraft({ ...draft, place: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Seat capacity (optional)</Label>
              <Input value={draft.seatsTotal} onChange={(e) => setDraft({ ...draft, seatsTotal: e.target.value })} placeholder="60" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={publish}>Publish event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
