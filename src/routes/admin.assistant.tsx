import { createFileRoute } from "@tanstack/react-router";
import { Bot, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Avatar, Chip, PageHeader } from "@/components/ui-kit/primitives";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAppState } from "@/lib/app-state";
import { recommendTeam } from "@/lib/recommendations";

export const Route = createFileRoute("/admin/assistant")({
  head: () => ({
    meta: [
      { title: "Talent Assistant — AAVISHKAR Admin" },
      { name: "description", content: "Describe the team you need and get a recommended student line-up." },
      { property: "og:title", content: "Talent Assistant — AAVISHKAR Admin" },
      { property: "og:description", content: "Skill-based team recommendations for ATL coordinators." },
    ],
  }),
  component: AssistantPage,
});

function AssistantPage() {
  const { students, shortlistMany, findStudent } = useAppState();
  const [prompt, setPrompt] = useState("Find students for an AI + robotics project.");
  const [state, setState] = useState<"idle" | "thinking" | "done">("idle");
  const [recommendations, setRecommendations] = useState<{ studentId: string; reason: string }[]>(
    [],
  );

  const run = () => {
    setState("thinking");
    setTimeout(() => {
      setRecommendations(recommendTeam(prompt, students));
      setState("done");
    }, 400);
  };

  const resolved = useMemo(
    () =>
      recommendations
        .map((r) => ({ ...r, student: findStudent(r.studentId) }))
        .filter((r) => r.student),
    [recommendations],
  );

  return (
    <>
      <PageHeader
        title="AAVISHKAR Talent Matcher"
        subtitle="Skill-based team recommendations for ATL coordinators (not a live LLM)."
      />

      <div className="surface hero-mesh p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent">
            <Bot className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-semibold">Describe the team you need...</p>
            <p className="text-xs text-muted-foreground">
              Recommendations are computed from registered student profiles.
            </p>
          </div>
        </div>

        <Textarea
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="mt-5 resize-none bg-card text-base"
        />
        <Button className="mt-4 gap-2" onClick={run} disabled={state === "thinking"}>
          <Sparkles className="h-4 w-4" />
          {state === "thinking" ? "Assembling team..." : "Recommend a team"}
        </Button>
      </div>

      {state === "done" && (
        <section className="mt-8 animate-fade-in">
          <h2 className="text-lg font-semibold">Recommended Team</h2>
          {resolved.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No matching students found. Try broader keywords.</p>
          ) : (
            <div className="mt-4 grid gap-3">
              {resolved.map((r) => {
                const s = r.student!;
                return (
                  <div key={r.studentId} className="surface flex items-start gap-4 p-5">
                    <Avatar initials={s.initials} accent={s.accent} />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{s.name}</p>
                      <p className="text-sm text-muted-foreground">{s.skills.join(" · ")}</p>
                      <p className="mt-2 rounded-lg border border-accent/25 bg-accent/8 px-3 py-2 text-xs text-primary">
                        {r.reason}
                      </p>
                    </div>
                    <Chip>{s.className}</Chip>
                  </div>
                );
              })}
            </div>
          )}
          {resolved.length > 0 && (
            <Button className="mt-5" onClick={() => shortlistMany(recommendations.map((r) => r.studentId))}>
              Shortlist Recommended Students
            </Button>
          )}
        </section>
      )}
    </>
  );
}
