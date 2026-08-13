import { createFileRoute, Link } from "@tanstack/react-router";
import { Chip, PageHeader, ProgressBar, Avatar } from "@/components/ui-kit/primitives";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/lib/app-state";

export const Route = createFileRoute("/admin/projects")({
  head: () => ({
    meta: [
      { title: "Projects — AAVISHKAR Admin" },
      { name: "description", content: "All APSDK student projects with teams, progress and deadlines." },
      { property: "og:title", content: "Projects — AAVISHKAR Admin" },
      { property: "og:description", content: "Monitor every ATL project in one table." },
    ],
  }),
  component: AdminProjects,
});

function AdminProjects() {
  const { projects, findStudent } = useAppState();

  return (
    <>
      <PageHeader title="Projects" subtitle="Every project running under ATL • APSDK." />
      <div className="surface overflow-x-auto">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              {["Project", "Team", "Progress", "Deadline", "Status", ""].map((h) => (
                <th key={h} className="px-5 py-3.5 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {projects.map((p) => (
              <tr key={p.id} className="hover:bg-secondary/50">
                <td className="px-5 py-4">
                  <p className="font-medium">{p.title}</p>
                  <p className="max-w-md truncate text-xs text-muted-foreground">{p.description}</p>
                </td>
                <td className="px-5 py-4">
                  <div className="flex -space-x-2">
                    {p.memberIds.map((m) => {
                      const s = findStudent(m);
                      return <Avatar key={m} initials={s?.initials ?? "?"} accent={s?.accent} size="xs" />;
                    })}
                  </div>
                </td>
                <td className="w-48 px-5 py-4">
                  <div className="flex items-center gap-2">
                    <ProgressBar value={p.progress} />
                    <span className="w-9 shrink-0 text-xs font-semibold">{p.progress}%</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-muted-foreground">{p.deadline}</td>
                <td className="px-5 py-4">
                  <Chip tone={p.status === "Active" ? "success" : "neutral"}>{p.status}</Chip>
                </td>
                <td className="px-5 py-4 text-right">
                  <Button asChild size="sm" variant="outline">
                    <Link to="/app/projects/$id" params={{ id: p.id }}>
                      Open workspace
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
