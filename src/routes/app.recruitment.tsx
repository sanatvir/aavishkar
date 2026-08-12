import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Chip, EmptyState, PageHeader } from "@/components/ui-kit/primitives";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAppState } from "@/lib/app-state";

export const Route = createFileRoute("/app/recruitment")({
  head: () => ({
    meta: [
      { title: "Recruitment — AAVISHKAR" },
      { name: "description", content: "Apply to ATL team recruitments and open calls at APSDK." },
    ],
  }),
  component: RecruitmentPage,
});

function RecruitmentPage() {
  const { recruitments, applications, hasApplied, applyToRecruitment } = useAppState();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const open = recruitments.find((r) => r.id === activeId);
  const openCalls = recruitments.filter((r) => r.status !== "Closed");

  return (
    <>
      <PageHeader title="Recruitment" subtitle="ATL team calls and cohort applications open to students." />

      {openCalls.length === 0 ? (
        <EmptyState title="No open recruitments" hint="Check back when coordinators publish new calls." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {openCalls.map((r) => {
            const applied = hasApplied(r.id);
            return (
              <article key={r.id} className="surface flex h-full flex-col gap-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="min-w-0 text-lg font-semibold">{r.title}</h3>
                  <Chip tone={r.status === "Applications Open" ? "success" : "accent"}>{r.status}</Chip>
                </div>
                <p className="text-sm text-muted-foreground">{r.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {r.skills.map((s) => (
                    <Chip key={s} tone="accent">
                      {s}
                    </Chip>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  {applications.filter((a) => a.recruitmentId === r.id).length} applications · closes{" "}
                  {r.closes}
                </p>
                <Button
                  className="mt-auto"
                  variant={applied ? "secondary" : "default"}
                  disabled={applied || r.status !== "Applications Open"}
                  onClick={() => {
                    setActiveId(r.id);
                    setNote("");
                  }}
                >
                  {applied ? "Applied" : "Apply now"}
                </Button>
              </article>
            );
          })}
        </div>
      )}

      <Dialog open={!!activeId} onOpenChange={(v) => !v && setActiveId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{open?.title}</DialogTitle>
            <DialogDescription>Tell the coordinator why you're a good fit.</DialogDescription>
          </DialogHeader>
          <Textarea
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Your skills, past projects, availability..."
          />
          <DialogFooter>
            <Button
              onClick={() => {
                if (!activeId || !note.trim()) return;
                if (applyToRecruitment(activeId, note.trim())) {
                  setActiveId(null);
                  setNote("");
                }
              }}
            >
              Submit application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
