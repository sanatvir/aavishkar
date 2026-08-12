import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Avatar, Chip, PageHeader, ProgressBar, SectionHeading } from "@/components/ui-kit/primitives";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/lib/app-state";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "ATL Admin Dashboard — AAVISHKAR" },
      { name: "description", content: "Platform-wide view of APSDK students, projects, recruitment and events." },
      { property: "og:title", content: "ATL Admin Dashboard — AAVISHKAR" },
      { property: "og:description", content: "Talent, projects and recruitment analytics for ATL APSDK." },
    ],
  }),
  component: AdminDashboard,
});

const pieColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

function AdminDashboard() {
  const {
    projects,
    applications,
    adminStats,
    engagementSeries,
    skillDistribution,
    categorySplit,
    activity,
    events,
    findStudent,
  } = useAppState();

  return (
    <>
      <PageHeader
        title="ATL Admin Dashboard"
        subtitle="Talent, projects and recruitment across APS Dhaula Kuan."
        action={
          <Button asChild className="gap-2">
            <Link to="/admin/assistant">Open AI Assistant</Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        {adminStats.map((s) => (
          <div key={s.label} className="surface p-4">
            <p className="text-2xl font-bold tracking-tight">{s.value}</p>
            <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
            <p className="mt-2 text-[0.68rem] text-accent-foreground/70">{s.delta}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <div className="surface p-5">
          <SectionHeading title="Platform growth" subtitle="Registered students and active projects" />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={engagementSeries}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="students"
                  stroke="var(--chart-1)"
                  fill="url(#g1)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="projects"
                  stroke="var(--chart-2)"
                  fill="transparent"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface p-5">
          <SectionHeading title="Idea categories" subtitle="Share of ideas on the platform" />
          <div className="h-64">
            {categorySplit.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categorySplit} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90}>
                    {categorySplit.map((_, i) => (
                      <Cell key={i} fill={pieColors[i % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      background: "var(--card)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="flex h-full items-center justify-center text-sm text-muted-foreground">No ideas yet</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {categorySplit.map((c, i) => (
              <span key={c.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: pieColors[i % pieColors.length] }}
                />
                {c.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <div className="surface p-5">
          <SectionHeading title="Skill distribution" />
          <div className="h-56">
            {skillDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillDistribution}>
                  <CartesianGrid stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="skill" stroke="var(--muted-foreground)" fontSize={11} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      background: "var(--card)",
                    }}
                  />
                  <Bar dataKey="students" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No skill data yet
              </p>
            )}
          </div>
        </div>

        <div className="surface p-5">
          <SectionHeading title="Recent activity" />
          <ul className="space-y-3">
            {activity.map((a) => (
              <li key={`${a.text}-${a.time}`} className="text-sm">
                <p className="text-foreground/85">{a.text}</p>
                <p className="text-xs text-muted-foreground">{a.time}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="surface p-5">
          <SectionHeading title="Upcoming events" />
          <ul className="space-y-3">
            {events.map((e) => (
              <li key={e.id} className="flex items-start justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{e.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {e.date} · {e.place}
                  </p>
                </div>
                <Chip>{e.seats}</Chip>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <div className="surface p-5">
          <SectionHeading title="Active projects" />
          <ul className="space-y-4">
            {projects.map((p) => (
              <li key={p.id}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate font-medium">{p.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {p.memberIds.length} members · {p.progress}%
                  </span>
                </div>
                <ProgressBar value={p.progress} className="mt-1.5" />
              </li>
            ))}
          </ul>
        </div>

        <div className="surface p-5">
          <SectionHeading
            title="Pending applications"
            action={
              <Button asChild variant="ghost" size="sm">
                <Link to="/admin/recruitment">Review</Link>
              </Button>
            }
          />
          <ul className="space-y-3">
            {applications
              .filter((a) => a.stage === "New" || a.stage === "Reviewed")
              .map((a) => {
                const s = findStudent(a.studentId);
                return (
                  <li key={a.id} className="flex items-center gap-3">
                    <Avatar initials={s?.initials ?? "?"} accent={s?.accent} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{s?.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{a.note}</p>
                    </div>
                    <Chip tone={a.stage === "New" ? "warning" : "neutral"}>{a.stage}</Chip>
                  </li>
                );
              })}
          </ul>
        </div>
      </div>
    </>
  );
}
