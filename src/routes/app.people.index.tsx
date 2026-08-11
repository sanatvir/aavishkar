import { createFileRoute } from "@tanstack/react-router";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { StudentCard } from "@/components/cards";
import { Chip, EmptyState, PageHeader } from "@/components/ui-kit/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppState } from "@/lib/app-state";
import { allClasses, allInterests, allSkills } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/people/")({
  head: () => ({
    meta: [
      { title: "Discover People — AAVISHKAR" },
      {
        name: "description",
        content: "Search APSDK students by skills, interests, class and availability.",
      },
      { property: "og:title", content: "Discover People — AAVISHKAR" },
      { property: "og:description", content: "Find collaborators across Class IX to XII." },
    ],
  }),
  component: PeoplePage,
});

const availabilities = ["Available", "Open to teams", "Busy"];

function FilterGroup({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button key={o} onClick={() => onToggle(o)}>
            <Chip
              tone={selected.includes(o) ? "accent" : "neutral"}
              className={cn(
                "transition-colors",
                selected.includes(o) && "border-accent bg-accent/20 font-semibold",
              )}
            >
              {o}
            </Chip>
          </button>
        ))}
      </div>
    </div>
  );
}

function PeoplePage() {
  const { directoryStudents, currentUser, filterOptions } = useAppState();
  const [query, setQuery] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [avail, setAvail] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(true);

  const toggle = (setter: React.Dispatch<React.SetStateAction<string[]>>) => (v: string) =>
    setter((prev) => (prev.includes(v) ? prev.filter((p) => p !== v) : [...prev, v]));

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return directoryStudents
      .filter((s) => s.id !== currentUser.id)
      .filter((s) => {
        const haystack = [s.name, s.className, s.bio, ...s.skills, ...s.interests]
          .join(" ")
          .toLowerCase();
        const matchesQuery = !q || q.split(/[\s+]+/).every((t) => haystack.includes(t));
        const matchesSkills = !skills.length || skills.every((k) => s.skills.includes(k));
        const matchesInterests = !interests.length || interests.some((i) => s.interests.includes(i));
        const matchesClass = !classes.length || classes.some((c) => s.className.startsWith(c));
        const matchesAvail = !avail.length || avail.includes(s.availability);
        return matchesQuery && matchesSkills && matchesInterests && matchesClass && matchesAvail;
      });
  }, [query, skills, interests, classes, avail, directoryStudents, currentUser.id]);

  const activeCount = skills.length + interests.length + classes.length + avail.length;

  return (
    <>
      <PageHeader
        title="Discover People"
        subtitle="Find the students who can help you build what you're imagining."
        action={
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setShowFilters((v) => !v)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters{activeCount ? ` · ${activeCount}` : ""}
          </Button>
        }
      />

      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search students, skills or interests..."
          className="h-13 rounded-xl pl-11 text-base shadow-soft"
        />
      </div>

      {showFilters && (
        <div className="surface mt-4 animate-fade-in space-y-5 p-5">
          <FilterGroup label="Skills" options={filterOptions.skills.length ? filterOptions.skills : allSkills} selected={skills} onToggle={toggle(setSkills)} />
          <FilterGroup
            label="Interests"
            options={filterOptions.interests.length ? filterOptions.interests : allInterests}
            selected={interests}
            onToggle={toggle(setInterests)}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <FilterGroup
              label="Class"
              options={filterOptions.classes.length ? filterOptions.classes : allClasses}
              selected={classes}
              onToggle={toggle(setClasses)}
            />
            <FilterGroup
              label="Availability"
              options={availabilities}
              selected={avail}
              onToggle={toggle(setAvail)}
            />
          </div>
          {activeCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5"
              onClick={() => {
                setSkills([]);
                setInterests([]);
                setClasses([]);
                setAvail([]);
              }}
            >
              <X className="h-3.5 w-3.5" /> Clear filters
            </Button>
          )}
        </div>
      )}

      <p className="mt-6 text-sm text-muted-foreground">
        {results.length} student{results.length === 1 ? "" : "s"} found
      </p>

      {results.length === 0 ? (
        <div className="mt-4">
          <EmptyState title="No students match those filters" hint="Try removing a skill or class filter." />
        </div>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {results.map((s) => (
            <StudentCard key={s.id} student={s} />
          ))}
        </div>
      )}
    </>
  );
}
