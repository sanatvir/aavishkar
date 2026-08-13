import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { StudentProfile } from "@/components/StudentProfile";
import { Avatar, Chip, EmptyState, PageHeader } from "@/components/ui-kit/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAppState } from "@/lib/app-state";
import type { Student } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/talent")({
  head: () => ({
    meta: [
      { title: "Find Talent — AAVISHKAR Admin" },
      { name: "description", content: "Search APSDK students by skill combinations and build shortlists." },
      { property: "og:title", content: "Find Talent — AAVISHKAR Admin" },
      { property: "og:description", content: "Skill-based talent discovery for ATL teams." },
    ],
  }),
  component: TalentPage,
});

function TalentPage() {
  const [query, setQuery] = useState("Python + Robotics");
  const [active, setActive] = useState<Student | null>(null);
  const { shortlist, toggleShortlist, students } = useAppState();

  const results = useMemo(() => {
    const terms = query
      .toLowerCase()
      .split("+")
      .map((t) => t.trim())
      .filter(Boolean);
    if (!terms.length) return students;
    return students
      .map((s) => {
        const hay = [...s.skills, ...s.interests].join(" ").toLowerCase();
        const score = terms.filter((t) => hay.includes(t)).length;
        return { s, score };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((r) => r.s);
  }, [query, students]);

  return (
    <>
      <PageHeader
        title="Find Talent"
        subtitle="Combine skills with + to find students who match all of them."
        action={
          shortlist.length > 0 ? (
            <Link
              to="/admin/shortlist"
              className="inline-flex items-center rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent-foreground transition-colors hover:bg-accent/25"
            >
              {shortlist.length} shortlisted →
            </Link>
          ) : (
            <Chip tone="neutral">0 shortlisted</Chip>
          )
        }
      />

      <div className="relative max-w-xl">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Python + Robotics"
          className="h-13 rounded-xl pl-11 text-base shadow-soft"
        />
      </div>

      {results.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="No students match that skill combination" hint="Try a single skill first." />
        </div>
      ) : (
        <div className="mt-6 grid gap-3">
          {results.map((s) => (
            <div key={s.id} className="surface flex flex-wrap items-center gap-4 p-4">
              <Avatar initials={s.initials} accent={s.accent} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{s.name}</p>
                <p className="text-sm text-muted-foreground">{s.skills.join(" · ")}</p>
              </div>
              <Chip tone={s.availability === "Available" ? "success" : "neutral"}>{s.availability}</Chip>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setActive(s)}>
                  View profile
                </Button>
                <Button
                  size="sm"
                  variant={shortlist.includes(s.id) ? "secondary" : "default"}
                  onClick={() => toggleShortlist(s.id)}
                >
                  {shortlist.includes(s.id) ? "Shortlisted" : "Shortlist"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Sheet open={!!active} onOpenChange={(v) => !v && setActive(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Student profile</SheetTitle>
          </SheetHeader>
          <div className="mt-4 px-4 pb-8">{active && <StudentProfile student={active} embedded />}</div>
        </SheetContent>
      </Sheet>
    </>
  );
}
