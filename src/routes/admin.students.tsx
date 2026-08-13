import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { StudentProfile } from "@/components/StudentProfile";
import { Avatar, Chip, PageHeader } from "@/components/ui-kit/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAppState } from "@/lib/app-state";
import { type Student } from "@/lib/mock-data";

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

function AdminStudents() {
  const { students, restrictStudent } = useAppState();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Student | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return students.filter((s) =>
      !q ? true : [s.name, s.className, ...s.skills].join(" ").toLowerCase().includes(q),
    );
  }, [query, students]);

  return (
    <>
      <PageHeader title="Student Directory" subtitle={`${students.length} students registered on AAVISHKAR.`} />

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
                    <Button size="sm" variant="outline" onClick={() => setActive(s)}>
                      Open
                    </Button>
                    {s.status === "Active" && (
                      <Button size="sm" variant="ghost" onClick={() => restrictStudent(s.id)}>
                        Restrict
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Sheet open={!!active} onOpenChange={(v) => !v && setActive(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Student record</SheetTitle>
          </SheetHeader>
          <div className="mt-4 px-4 pb-8">{active && <StudentProfile student={active} embedded />}</div>
        </SheetContent>
      </Sheet>
    </>
  );
}
