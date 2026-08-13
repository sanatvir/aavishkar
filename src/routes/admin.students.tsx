import { createFileRoute } from "@tanstack/react-router";
import { Plus, Radio, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { StudentProfile } from "@/components/StudentProfile";
import { Avatar, Chip, PageHeader } from "@/components/ui-kit/primitives";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useAppState } from "@/lib/app-state";
import { type Student } from "@/lib/mock-data";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export const Route = createFileRoute("/admin/students")({
  head: () => ({
    meta: [
      { title: "Student Directory — AAVISHKAR Admin" },
      { name: "description", content: "Searchable directory of APSDK students with skills, projects and status." },
      { property: "og:title", content: "Student Directory — AAVISHKAR Admin" },
      { property: "og:description", content: "Skills, projects, availability and status for every student." },
    ],
  }),
  component: AdminStudents,
});

const emptyDraft = () => ({
  name: "",
  className: "",
  bio: "",
  skills: "",
  interests: "",
  availability: "Available" as Student["availability"],
});

const splitList = (value: string) =>
  value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

function AdminStudents() {
  const { students, restrictStudent, reactivateStudent, addStudent, saveStudentRecord } = useAppState();
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [createDraft, setCreateDraft] = useState(emptyDraft);
  const [editDraft, setEditDraft] = useState<Student | null>(null);

  const active = useMemo(
    () => (activeId ? students.find((s) => s.id === activeId) ?? null : null),
    [activeId, students],
  );

  useEffect(() => {
    if (editOpen && active) setEditDraft({ ...active });
  }, [editOpen, active]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return students.filter((s) =>
      !q ? true : [s.name, s.className, ...s.skills].join(" ").toLowerCase().includes(q),
    );
  }, [query, students]);

  return (
    <>
      <PageHeader
        title="Student Directory"
        subtitle={`${students.length} students registered on AAVISHKAR.`}
        action={
          <div className="flex items-center gap-2">
            {isSupabaseConfigured && (
              <Chip tone="success" className="gap-1.5">
                <Radio className="h-3 w-3" />
                Live sync
              </Chip>
            )}
            <Button className="gap-2" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" /> Add student
            </Button>
          </div>
        }
      />

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, class or skill..."
          className="h-11 rounded-xl pl-11"
        />
      </div>

      <div className="surface mt-5 overflow-x-auto">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              {["Name", "Class", "Skills", "Projects", "Availability", "Status", ""].map((h) => (
                <th key={h} className="px-5 py-3.5 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((s) => (
              <tr key={s.id} className="transition-colors hover:bg-secondary/50">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <Avatar initials={s.initials} accent={s.accent} size="sm" />
                    <span className="font-medium">{s.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-muted-foreground">{s.className}</td>
                <td className="px-5 py-3.5">
                  <div className="flex flex-wrap gap-1">
                    {s.skills.slice(0, 3).map((k) => (
                      <Chip key={k} tone="accent">
                        {k}
                      </Chip>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-3.5 text-muted-foreground">{s.projects.length}</td>
                <td className="px-5 py-3.5">
                  <Chip tone={s.availability === "Available" ? "success" : "neutral"}>{s.availability}</Chip>
                </td>
                <td className="px-5 py-3.5">
                  <Chip tone={s.status === "Active" ? "success" : "danger"}>{s.status}</Chip>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => setActiveId(s.id)}>
                      Open
                    </Button>
                    {s.status === "Active" ? (
                      <Button size="sm" variant="ghost" onClick={() => restrictStudent(s.id)}>
                        Restrict
                      </Button>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => reactivateStudent(s.id)}>
                        Reactivate
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-muted-foreground">
                  No students match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Sheet open={!!active} onOpenChange={(v) => !v && setActiveId(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Student record</SheetTitle>
          </SheetHeader>
          {active && (
            <div className="mt-4 space-y-4 px-4 pb-8">
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>
                  Edit record
                </Button>
                {active.status === "Active" ? (
                  <Button size="sm" variant="ghost" onClick={() => restrictStudent(active.id)}>
                    Restrict access
                  </Button>
                ) : (
                  <Button size="sm" variant="ghost" onClick={() => reactivateStudent(active.id)}>
                    Reactivate
                  </Button>
                )}
              </div>
              <StudentProfile student={active} embedded />
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add student</DialogTitle>
          </DialogHeader>
          <StudentForm draft={createDraft} onChange={setCreateDraft} />
          <DialogFooter>
            <Button
              onClick={() => {
                addStudent(createDraft);
                setCreateOpen(false);
                setCreateDraft(emptyDraft());
              }}
            >
              Add to directory
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit student</DialogTitle>
          </DialogHeader>
          {editDraft && (
            <>
              <StudentForm
                draft={{
                  name: editDraft.name,
                  className: editDraft.className,
                  bio: editDraft.bio,
                  skills: editDraft.skills.join(", "),
                  interests: editDraft.interests.join(", "),
                  availability: editDraft.availability,
                }}
                onChange={(next) =>
                  setEditDraft({
                    ...editDraft,
                    name: next.name,
                    className: next.className,
                    bio: next.bio,
                    skills: splitList(next.skills),
                    interests: splitList(next.interests),
                    availability: next.availability,
                    initials:
                      next.name
                        .trim()
                        .split(/\s+/)
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase() || editDraft.initials,
                  })
                }
              />
              <DialogFooter>
                <Button
                  onClick={() => {
                    if (!editDraft) return;
                    saveStudentRecord(editDraft);
                    setEditOpen(false);
                  }}
                >
                  Save changes
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

type StudentFormDraft = {
  name: string;
  className: string;
  bio: string;
  skills: string;
  interests: string;
  availability: Student["availability"];
};

function StudentForm({
  draft,
  onChange,
}: {
  draft: StudentFormDraft;
  onChange: (draft: StudentFormDraft) => void;
}) {
  return (
    <div className="grid gap-3">
      <div className="space-y-1.5">
        <Label>Name</Label>
        <Input value={draft.name} onChange={(e) => onChange({ ...draft, name: e.target.value })} />
      </div>
      <div className="space-y-1.5">
        <Label>Class</Label>
        <Input
          value={draft.className}
          onChange={(e) => onChange({ ...draft, className: e.target.value })}
          placeholder="Class X-B"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Bio</Label>
        <Textarea rows={3} value={draft.bio} onChange={(e) => onChange({ ...draft, bio: e.target.value })} />
      </div>
      <div className="space-y-1.5">
        <Label>Skills</Label>
        <Input
          value={draft.skills}
          onChange={(e) => onChange({ ...draft, skills: e.target.value })}
          placeholder="Python, Robotics, UI/UX"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Interests</Label>
        <Input
          value={draft.interests}
          onChange={(e) => onChange({ ...draft, interests: e.target.value })}
          placeholder="Entrepreneurship, Technology"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Availability</Label>
        <Select
          value={draft.availability}
          onValueChange={(value) => onChange({ ...draft, availability: value as Student["availability"] })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Available">Available</SelectItem>
            <SelectItem value="Busy">Busy</SelectItem>
            <SelectItem value="Open to teams">Open to teams</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
