import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { IdeaCard } from "@/components/cards";
import { Chip, EmptyState, PageHeader } from "@/components/ui-kit/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppState } from "@/lib/app-state";
import { ideaCategories } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/ideas/")({
  head: () => ({
    meta: [
      { title: "Idea Hub — AAVISHKAR" },
      { name: "description", content: "Every great project starts with an idea. Browse and share ideas at APSDK." },
      { property: "og:title", content: "Idea Hub — AAVISHKAR" },
      { property: "og:description", content: "Browse, support and join student ideas." },
    ],
  }),
  component: IdeasPage,
});

function IdeasPage() {
  const { ideas, addIdea, filterOptions } = useAppState();
  const categories = filterOptions.categories.length ? filterOptions.categories : ideaCategories;
  const [category, setCategory] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({
    title: "",
    category: "AI",
    problem: "",
    solution: "",
    lookingFor: "",
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ideas.filter(
      (i) =>
        (!category || i.category === category) &&
        (!q || `${i.title} ${i.problem} ${i.solution}`.toLowerCase().includes(q)),
    );
  }, [ideas, category, query]);

  const submit = () => {
    if (!draft.title.trim()) return;
    addIdea(draft);
    setOpen(false);
    setDraft({ title: "", category: "AI", problem: "", solution: "", lookingFor: "" });
  };

  return (
    <>
      <PageHeader
        title="Idea Hub"
        subtitle="Every great project starts with an idea."
        action={
          <Button className="gap-2" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Share an Idea
          </Button>
        }
      />

      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search ideas..."
        className="h-12 rounded-xl shadow-soft"
      />

      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={() => setCategory(null)}>
          <Chip
            tone={category === null ? "accent" : "neutral"}
            className={cn(category === null && "border-accent bg-accent/20 font-semibold")}
          >
            All
          </Chip>
        </button>
        {categories.map((c) => (
          <button key={c} onClick={() => setCategory(c)}>
            <Chip
              tone={category === c ? "accent" : "neutral"}
              className={cn(category === c && "border-accent bg-accent/20 font-semibold")}
            >
              {c}
            </Chip>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="No ideas here yet" hint="Be the first to share an idea in this category." />
        </div>
      ) : (
        <div className="mt-8 grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {filtered.map((i) => (
            <IdeaCard key={i.id} idea={i} />
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Share an Idea</DialogTitle>
            <DialogDescription>
              Describe the problem clearly — that's what attracts collaborators.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder="Smart Library Shelf"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                value={draft.category}
                onValueChange={(v) => setDraft({ ...draft, category: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="problem">Problem</Label>
              <Textarea
                id="problem"
                rows={2}
                value={draft.problem}
                onChange={(e) => setDraft({ ...draft, problem: e.target.value })}
                placeholder="What isn't working today?"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="solution">Proposed solution</Label>
              <Textarea
                id="solution"
                rows={2}
                value={draft.solution}
                onChange={(e) => setDraft({ ...draft, solution: e.target.value })}
                placeholder="How would you solve it?"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="looking">Looking for</Label>
              <Input
                id="looking"
                value={draft.lookingFor}
                onChange={(e) => setDraft({ ...draft, lookingFor: e.target.value })}
                placeholder="Python, Electronics, Design"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={!draft.title.trim()}>
              Share idea
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
