import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Star, UserSearch } from "lucide-react";
import { useMemo, useState } from "react";
import { StudentProfile } from "@/components/StudentProfile";
import { Avatar, Chip, EmptyState, PageHeader } from "@/components/ui-kit/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAppState } from "@/lib/app-state";
import type { Student } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/shortlist")({
  head: () => ({
    meta: [
      { title: "Shortlisted Students — AAVISHKAR Admin" },
      {
        name: "description",
        content: "Review and manage your shortlisted APSDK students for ATL teams and recruitment.",
      },
      { property: "og:title", content: "Shortlisted Students — AAVISHKAR Admin" },
      {
        property: "og:description",
        content: "Central shortlist of talent flagged from recruitment and talent search.",
      },
    ],
  }),
  component: AdminShortlistPage,
});

function AdminShortlistPage() {
  const { shortlist, toggleShortlist, students, findStudent } = useAppState();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Student | null>(null);

  const shortlistedStudents = useMemo(() => {
    const list = shortlist
      .map((id) => findStudent(id) ?? students.find((s) => s.id === id))
      .filter((s): s is Student => s != null);
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((s) =>
      [s.name, s.className, ...s.skills, ...s.interests].join(" ").toLowerCase().includes(q),
    );
  }, [shortlist, findStudent, students, query]);

  return (
    <>
      <PageHeader
        title="Shortlisted Students"
        subtitle="Students you've flagged from Talent search or Recruitment reviews."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Chip tone="accent" className="gap-1.5">
              <Star className="h-3 w-3 fill-current" />
              {shortlist.length} total
            </Chip>
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link to="/admin/talent">
                <UserSearch className="h-4 w-4" />
                Find more talent
              </Link>
            </Button>
          </div>
        }
      />

      {shortlist.length > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search shortlisted students..."
            className="h-11 rounded-xl pl-11"
          />
        </div>
      )}

      {shortlist.length === 0 ? (
        <div className="mt-6 space-y-4">
          <EmptyState
            title="No students shortlisted yet"
            hint="Shortlist students from Find Talent or Recruitment when reviewing applications."
          />
          <div className="flex flex-wrap justify-center gap-2">
            <Button asChild>
              <Link to="/admin/talent">Find Talent</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/admin/recruitment">Recruitment</Link>
            </Button>
          </div>
        </div>
      ) : shortlistedStudents.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="No matches for that search" hint="Try a different name, class or skill." />
        </div>
      ) : (
        <div className="surface mt-5 overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                {["Student", "Class", "Skills", "Availability", "Status", ""].map((h) => (
                  <th key={h} className="px-5 py-3.5 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shortlistedStudents.map((s) => (
                <tr key={s.id} className="border-b border-border/60 last:border-0">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar initials={s.initials} accent={s.accent} size="sm" src={s.avatarUrl} />
                      <span className="font-medium">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{s.className}</td>
                  <td className="max-w-[220px] truncate px-5 py-4 text-muted-foreground">
                    {s.skills.join(" · ") || "—"}
                  </td>
                  <td className="px-5 py-4">
                    <Chip tone={s.availability === "Available" ? "success" : "neutral"}>{s.availability}</Chip>
                  </td>
                  <td className="px-5 py-4">
                    <Chip tone={s.status === "Active" ? "success" : "warning"}>{s.status}</Chip>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => setActive(s)}>
                        View profile
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => toggleShortlist(s.id)}>
                        Remove
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Sheet open={!!active} onOpenChange={(v) => !v && setActive(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Shortlisted student</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-4 px-4 pb-8">
            {active && <StudentProfile student={active} embedded />}
            {active && (
              <Button variant="outline" className="w-full" onClick={() => toggleShortlist(active.id)}>
                Remove from shortlist
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
