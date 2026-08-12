import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Avatar, Chip, PageHeader } from "@/components/ui-kit/primitives";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAppState } from "@/lib/app-state";

export const Route = createFileRoute("/admin/recruitment")({
  head: () => ({
    meta: [
      { title: "Recruitment — AAVISHKAR Admin" },
      { name: "description", content: "Manage ATL team recruitments, applications and shortlists." },
      { property: "og:title", content: "Recruitment — AAVISHKAR Admin" },
      { property: "og:description", content: "Review, shortlist, accept or reject student applications." },
    ],
  }),
  component: RecruitmentPage,
});

const stageTone = {
  New: "warning",
  Reviewed: "neutral",
  Shortlisted: "accent",
  Accepted: "success",
  Rejected: "danger",
} as const;

function RecruitmentPage() {
  const { recruitments, applications, setApplicationStage, setRecruitmentStatus, toggleShortlist, shortlist, findStudent, addRecruitment } =
    useAppState();
  const [openId, setOpenId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [draft, setDraft] = useState({ title: "", description: "", skills: "", closes: "" });

  const openRecruitment = recruitments.find((r) => r.id === openId);
  const openApps = applications.filter((a) => a.recruitmentId === openId);

  return (
    <>
      <PageHeader
        title="Recruitment"
        subtitle="Open calls, applications and team selection."
        action={
          <Button className="gap-2" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" /> New call
          </Button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-2">
        {recruitments.map((r) => (
          <article key={r.id} className="surface flex h-full flex-col gap-4 p-5">
            <div className="flex items-start justify-between gap-3">
              <h3 className="min-w-0 text-lg font-semibold">{r.title}</h3>
              <Chip
                tone={
                  r.status === "Applications Open" ? "success" : r.status === "Closed" ? "danger" : "accent"
                }
              >
                {r.status}
              </Chip>
            </div>
            <p className="text-sm text-muted-foreground">{r.description}</p>
            <div className="flex flex-wrap gap-1.5">
              {r.skills.map((s) => (
                <Chip key={s} tone="accent">
                  {s}
                </Chip>
              ))}
            </div>
            <p className="text-sm">
              <span className="font-semibold">
                {applications.filter((a) => a.recruitmentId === r.id).length || r.applications}
              </span>{" "}
              <span className="text-muted-foreground">applications · closes {r.closes}</span>
            </p>
            <div className="mt-auto flex flex-wrap gap-2">
              <Button size="sm" onClick={() => setOpenId(r.id)}>
                View Applications
              </Button>
              <Button size="sm" variant="outline" onClick={() => setRecruitmentStatus(r.id, "Shortlisting")}>
                Shortlist
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setRecruitmentStatus(r.id, "Closed")}>
                Close Recruitment
              </Button>
            </div>
          </article>
        ))}
      </div>

      <Dialog open={!!openId} onOpenChange={(v) => !v && setOpenId(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{openRecruitment?.title}</DialogTitle>
            <DialogDescription>
              {openApps.length} application{openApps.length === 1 ? "" : "s"} awaiting review.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {openApps.map((a) => {
              const s = findStudent(a.studentId);
              return (
                <div key={a.id} className="rounded-xl border border-border p-4">
                  <div className="flex items-center gap-3">
                    <Avatar initials={s?.initials ?? "?"} accent={s?.accent} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{s?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {s?.className} · submitted {a.submitted}
                      </p>
                    </div>
                    <Chip tone={stageTone[a.stage]}>{a.stage}</Chip>
                  </div>
                  <p className="mt-3 text-sm text-foreground/80">{a.note}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => setApplicationStage(a.id, "Reviewed")}>
                      Review
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setApplicationStage(a.id, "Shortlisted");
                        if (!shortlist.includes(a.studentId)) toggleShortlist(a.studentId);
                      }}
                    >
                      Shortlist
                    </Button>
                    <Button size="sm" onClick={() => setApplicationStage(a.id, "Accepted")}>
                      Accept
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setApplicationStage(a.id, "Rejected")}>
                      Reject
                    </Button>
                  </div>
                </div>
              );
            })}
            {openApps.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No applications recorded for this call.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New recruitment call</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea rows={3} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Skills needed</Label>
              <Input value={draft.skills} onChange={(e) => setDraft({ ...draft, skills: e.target.value })} placeholder="Python, Robotics" />
            </div>
            <div className="space-y-1.5">
              <Label>Closes</Label>
              <Input value={draft.closes} onChange={(e) => setDraft({ ...draft, closes: e.target.value })} placeholder="26 August" />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                if (!draft.title.trim()) return;
                addRecruitment(draft);
                setCreateOpen(false);
                setDraft({ title: "", description: "", skills: "", closes: "" });
              }}
            >
              Publish call
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
