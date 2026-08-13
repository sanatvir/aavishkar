import { createFileRoute } from "@tanstack/react-router";
import { Chip, PageHeader } from "@/components/ui-kit/primitives";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/lib/app-state";

export const Route = createFileRoute("/admin/ideas")({
  head: () => ({
    meta: [{ title: "Idea moderation — AAVISHKAR Admin" }],
  }),
  component: AdminIdeasModeration,
});

function AdminIdeasModeration() {
  const { pendingIdeas, publishIdea, rejectIdea, findStudent } = useAppState();

  return (
    <>
      <PageHeader
        title="Idea moderation"
        subtitle="Review student ideas before they appear in the Idea Hub."
      />
      {pendingIdeas.length === 0 ? (
        <p className="text-sm text-muted-foreground">No ideas awaiting review.</p>
      ) : (
        <div className="grid gap-4">
          {pendingIdeas.map((idea) => {
            const creator = findStudent(idea.creatorId);
            return (
              <article key={idea.id} className="surface space-y-3 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{idea.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {creator?.name ?? "Student"} · {idea.category}
                    </p>
                  </div>
                  <Chip tone="warning">Pending review</Chip>
                </div>
                <p className="text-sm">{idea.problem}</p>
                <p className="text-sm text-muted-foreground">{idea.solution}</p>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => publishIdea(idea.id)}>
                    Publish to Idea Hub
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => rejectIdea(idea.id)}>
                    Reject
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
