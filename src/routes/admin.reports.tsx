import { createFileRoute } from "@tanstack/react-router";
import { Chip, PageHeader } from "@/components/ui-kit/primitives";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/lib/app-state";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({
    meta: [
      { title: "Moderation Reports — AAVISHKAR Admin" },
      { name: "description", content: "Review reported users and content, dismiss or restrict accounts." },
      { property: "og:title", content: "Moderation Reports — AAVISHKAR Admin" },
      { property: "og:description", content: "Basic moderation queue for the AAVISHKAR platform." },
    ],
  }),
  component: AdminReports,
});

const tone = {
  Open: "warning",
  Reviewing: "accent",
  Dismissed: "neutral",
  Restricted: "danger",
} as const;

function AdminReports() {
  const { reports, setReportStatus } = useAppState();

  return (
    <>
      <PageHeader title="Reports" subtitle="Moderation queue for reported users and content." />
      <div className="surface overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              {["Reported", "Type", "Reason", "Date", "Status", "Actions"].map((h) => (
                <th key={h} className="px-5 py-3.5 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {reports.map((r) => (
              <tr key={r.id} className="hover:bg-secondary/50">
                <td className="px-5 py-4 font-medium">{r.target}</td>
                <td className="px-5 py-4 text-muted-foreground">{r.kind}</td>
                <td className="px-5 py-4 text-muted-foreground">{r.reason}</td>
                <td className="px-5 py-4 text-muted-foreground">{r.date}</td>
                <td className="px-5 py-4">
                  <Chip tone={tone[r.status]}>{r.status}</Chip>
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => setReportStatus(r.id, "Reviewing")}>
                      Review
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setReportStatus(r.id, "Dismissed")}>
                      Dismiss
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => setReportStatus(r.id, "Restricted")}>
                      Restrict
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
