import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
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
import {
  Avatar,
  Chip,
  PageHeader,
  ProgressBar,
  SectionHeading,
} from "@/components/ui-kit/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppState } from "@/lib/app-state";
import { type Student } from "@/lib/types";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "ATL Admin Dashboard — AAVISHKAR" },
      {
        name: "description",
        content: "Platform-wide view of APSDK students, projects, recruitment and events.",
      },
      { property: "og:title", content: "ATL Admin Dashboard — AAVISHKAR" },
      {
        property: "og:description",
        content: "Talent, projects and recruitment analytics for ATL APSDK.",
      },
    ],
  }),
  component: AdminDashboard,
});

const pieColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

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
    students,
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

      <RegisteredStudentsPanel students={students} />

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <div className="surface p-5">
          <SectionHeading
            title="Platform growth"
            subtitle="Registered students and active projects"
          />
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
                  <Pie
                    data={categorySplit}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={90}
                  >
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
              <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No ideas yet
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {categorySplit.map((c, i) => (
              <span
                key={c.name}
                className="flex items-center gap-1.5 text-xs text-muted-foreground"
              >
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
            {activity.map((a, i) => (
              <li key={`${i}-${a.text}-${a.time}`} className="text-sm">
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

function RegisteredStudentsPanel({ students }: { students: Student[] }) {
  const [query, setQuery] = useState("");
  const [classFilter, setClassFilter] = useState("All");
  const [interestFilter, setInterestFilter] = useState("All");

  const classes = useMemo(
    () => ["All", ...Array.from(new Set(students.map((s) => s.className))).sort()],
    [students],
  );
  const interests = useMemo(
    () => ["All", ...Array.from(new Set(students.flatMap((s) => s.interests))).sort()],
    [students],
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return students.filter((s) => {
      if (classFilter !== "All" && s.className !== classFilter) return false;
      if (interestFilter !== "All" && !s.interests.includes(interestFilter)) return false;
      if (!q) return true;
      return [s.name, s.className, ...s.skills, ...s.interests].join(" ").toLowerCase().includes(q);
    });
  }, [students, query, classFilter, interestFilter]);

  return (
    <div className="surface p-5">
      <SectionHeading
        title="Registered students"
        subtitle={`${students.length} registered · ${rows.length} shown`}
        action={
          <Button asChild variant="ghost" size="sm">
            <Link to="/admin/students">View directory</Link>
          </Button>
        }
      />

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search students, skills or interests..."
            className="h-10 rounded-xl pl-11"
          />
        </div>
        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger className="h-10 sm:w-48">
            <SelectValue placeholder="All classes" />
          </SelectTrigger>
          <SelectContent>
            {classes.map((c) => (
              <SelectItem key={c} value={c}>
                {c === "All" ? "All classes" : c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={interestFilter} onValueChange={setInterestFilter}>
          <SelectTrigger className="h-10 sm:w-52">
            <SelectValue placeholder="All interest areas" />
          </SelectTrigger>
          <SelectContent>
            {interests.map((i) => (
              <SelectItem key={i} value={i}>
                {i === "All" ? "All interest areas" : i}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-4 max-h-80 space-y-2 overflow-y-auto pr-1">
        {rows.map((s) => (
          <div key={s.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
            <Avatar initials={s.initials} accent={s.accent} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate font-medium">{s.name}</span>
                <Chip tone={s.status === "Active" ? "success" : "neutral"}>{s.status}</Chip>
              </div>
              <p className="truncate text-xs text-muted-foreground">{s.className}</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {s.interests.slice(0, 4).map((i) => (
                  <Chip key={i} tone="accent">
                    {i}
                  </Chip>
                ))}
              </div>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link to="/admin/students">Open</Link>
            </Button>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No students match your filters.
          </p>
        )}
      </div>
    </div>
  );
}
