import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays } from "lucide-react";
import { useState } from "react";
import { Chip, PageHeader } from "@/components/ui-kit/primitives";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppState } from "@/lib/app-state";
import { type Opportunity } from "@/lib/mock-data";

export const Route = createFileRoute("/app/opportunities")({
  head: () => ({
    meta: [
      { title: "Opportunities — AAVISHKAR" },
      { name: "description", content: "Competitions, workshops and ATL events open to APSDK students." },
      { property: "og:title", content: "Opportunities — AAVISHKAR" },
      { property: "og:description", content: "Competitions, workshops and ATL events with deadlines." },
    ],
  }),
  component: OpportunitiesPage,
});

function OpportunitiesPage() {
  const { savedOpportunities, registeredOpportunities, toggleOpportunity, registerForOpportunity, opportunities } = useAppState();
  const [active, setActive] = useState<Opportunity | null>(null);

  return (
    <>
      <PageHeader title="Opportunities" subtitle="Competitions, workshops and ATL events." />
      <div className="grid gap-4 lg:grid-cols-2">
        {opportunities.map((o) => (
          <article key={o.id} className="surface lift flex h-full flex-col gap-4 p-5">
            <div className="flex items-start justify-between gap-3">
              <h3 className="min-w-0 text-lg font-semibold">{o.title}</h3>
              <Chip tone="accent">{o.type}</Chip>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">{o.description}</p>
            <div className="space-y-1.5 text-sm">
              <p>
                <span className="text-muted-foreground">Eligibility: </span>
                {o.eligibility}
              </p>
              <p>
                <span className="text-muted-foreground">Organizer: </span>
                {o.organizer}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {o.skills.map((s) => (
                <Chip key={s}>{s}</Chip>
              ))}
            </div>
            <p className="flex items-center gap-1.5 text-sm font-medium text-warning-foreground">
              <CalendarDays className="h-4 w-4" /> Deadline: {o.deadline}
            </p>
            <div className="mt-auto flex gap-2">
              <Button size="sm" className="flex-1" onClick={() => setActive(o)}>
                View Opportunity
              </Button>
              <Button
                size="sm"
                variant={savedOpportunities.includes(o.id) ? "secondary" : "outline"}
                onClick={() => toggleOpportunity(o.id, o.title)}
              >
                {savedOpportunities.includes(o.id) ? "Saved" : "Save"}
              </Button>
              {registeredOpportunities.includes(o.id) && (
                <Chip tone="success">Registered</Chip>
              )}
            </div>
          </article>
        ))}
      </div>

      <Dialog open={!!active} onOpenChange={(v) => !v && setActive(null)}>
        <DialogContent className="sm:max-w-lg">
          {active && (
            <>
              <DialogHeader>
                <DialogTitle>{active.title}</DialogTitle>
                <DialogDescription>
                  {active.type} · organised by {active.organizer}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <p className="leading-relaxed text-foreground/85">{active.description}</p>
                <p>
                  <span className="text-muted-foreground">Eligibility: </span>
                  {active.eligibility}
                </p>
                <p>
                  <span className="text-muted-foreground">Deadline: </span>
                  {active.deadline}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {active.skills.map((s) => (
                    <Chip key={s} tone="accent">
                      {s}
                    </Chip>
                  ))}
                </div>
                <Button
                  className="w-full"
                  variant={registeredOpportunities.includes(active.id) ? "secondary" : "default"}
                  disabled={registeredOpportunities.includes(active.id)}
                  onClick={() => {
                    registerForOpportunity(active.id, active.title);
                    setActive(null);
                  }}
                >
                  {registeredOpportunities.includes(active.id) ? "Registered" : "Register for this opportunity"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
