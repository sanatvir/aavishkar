import type { Application, Idea, Project, Recruitment, Student } from "./mock-data";

export type AdminStat = { label: string; value: number; delta: string };

export type EngagementPoint = { month: string; students: number; projects: number };

export type SkillCount = { skill: string; students: number };

export type CategoryCount = { name: string; value: number };

export type ActivityItem = { text: string; time: string };

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function buildAdminStats(input: {
  students: Student[];
  projects: Project[];
  recruitments: Recruitment[];
  applications: Application[];
  communities: { id: string }[];
  opportunities: { id: string }[];
}): AdminStat[] {
  const openRecruitments = input.recruitments.filter((r) => r.status !== "Closed").length;
  const closingSoon = input.recruitments.filter((r) => r.status === "Applications Open").length;
  const pendingApps = input.applications.filter(
    (a) => a.stage === "New" || a.stage === "Reviewed",
  ).length;
  const activeProjects = input.projects.filter((p) => p.status !== "Completed").length;

  return [
    { label: "Students", value: input.students.length, delta: `${input.students.filter((s) => s.status === "Active").length} active` },
    { label: "Active Projects", value: activeProjects, delta: `${input.projects.length} total` },
    { label: "Open Recruitments", value: openRecruitments, delta: `${closingSoon} accepting apps` },
    { label: "Pending Applications", value: pendingApps, delta: `${input.applications.length} total` },
    { label: "Communities", value: input.communities.length, delta: "Live communities" },
    { label: "Opportunities", value: input.opportunities.length, delta: "Published" },
  ];
}

export function buildSkillDistribution(students: Student[]): SkillCount[] {
  const counts = new Map<string, number>();
  for (const s of students) {
    for (const skill of s.skills) {
      counts.set(skill, (counts.get(skill) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([skill, students]) => ({ skill, students }))
    .sort((a, b) => b.students - a.students)
    .slice(0, 8);
}

export function buildCategorySplit(ideas: Idea[]): CategoryCount[] {
  const counts = new Map<string, number>();
  for (const idea of ideas) {
    if (idea.reviewStatus === "pending") continue;
    counts.set(idea.category, (counts.get(idea.category) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function buildEngagementSeries(
  students: Student[],
  projects: Project[],
  projectCreatedAt: Map<string, string>,
): EngagementPoint[] {
  const now = new Date();
  const points: EngagementPoint[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
    const monthLabel = MONTHS[d.getMonth()];

    const studentCount = students.filter((s) => {
      if (!s.createdAt) return true;
      return new Date(s.createdAt) <= monthEnd;
    }).length;
    const projectCount = projects.filter((p) => {
      const created = projectCreatedAt.get(p.id);
      if (!created) return true;
      return new Date(created) <= monthEnd;
    }).length;

    points.push({ month: monthLabel, students: studentCount, projects: projectCount });
  }

  return points;
}

export function mergeActivity(
  logged: ActivityItem[],
  ideas: Idea[],
  applications: Application[],
  students: Student[],
): ActivityItem[] {
  const derived: ActivityItem[] = [];

  const newestIdeas = [...ideas].slice(0, 3);
  for (const idea of newestIdeas) {
    const creator = students.find((s) => s.id === idea.creatorId);
    derived.push({
      text: `${creator?.name ?? "A student"} shared idea “${idea.title}”`,
      time: "Recently",
    });
  }

  const newApps = applications.filter((a) => a.stage === "New").slice(0, 2);
  for (const app of newApps) {
    const student = students.find((s) => s.id === app.studentId);
    derived.push({
      text: `${student?.name ?? "A student"} submitted a recruitment application`,
      time: "Recently",
    });
  }

  return [...logged, ...derived].slice(0, 8);
}
