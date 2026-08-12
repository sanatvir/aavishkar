import type {
  Application,
  Idea,
  Opportunity,
  Project,
  Recruitment,
  Report,
  Student,
} from "@/lib/types";
import type { PlatformEvent } from "@/lib/supabase/store";
import type { ActivityItem, AdminStat, SkillCount } from "@/lib/admin-metrics";
import { INSTITUTION_NAME, PLATFORM_NAME } from "@/lib/brand";

export type AssistantMessage = {
  role: "user" | "assistant";
  content: string;
  teamRecommendations?: { studentId: string; reason: string }[];
  suggestedFollowUps?: string[];
  source?: "groq" | "offline";
  errorKind?: "quota" | "auth" | "rate_limit" | "network" | "unknown";
};

export type PlatformContext = {
  platform: { name: string; institution: string; coordinatorName: string };
  stats: AdminStat[];
  topSkills: SkillCount[];
  recentActivity: ActivityItem[];
  students: {
    id: string;
    name: string;
    className: string;
    skills: string[];
    interests: string[];
    availability: Student["availability"];
    status: Student["status"];
  }[];
  pendingIdeas: { id: string; title: string; category: string; creatorId: string }[];
  projects: {
    id: string;
    title: string;
    status: Project["status"];
    progress: number;
    memberCount: number;
    deadline: string;
  }[];
  recruitments: {
    id: string;
    title: string;
    status: Recruitment["status"];
    skills: string[];
    closes: string;
    applications: number;
  }[];
  pendingApplications: {
    id: string;
    studentId: string;
    recruitmentTitle: string;
    stage: Application["stage"];
  }[];
  openReports: { id: string; target: string; kind: Report["kind"]; status: Report["status"] }[];
  upcomingEvents: { id: string; title: string; date: string; place: string }[];
  opportunities: { id: string; title: string; type: string; deadline: string }[];
};

export function buildPlatformContext(input: {
  coordinatorName: string;
  adminStats: AdminStat[];
  skillDistribution: SkillCount[];
  activity: ActivityItem[];
  students: Student[];
  pendingIdeas: Idea[];
  projects: Project[];
  recruitments: Recruitment[];
  applications: Application[];
  reports: Report[];
  events: PlatformEvent[];
  opportunities: Opportunity[];
}): PlatformContext {
  const recruitmentTitles = new Map(input.recruitments.map((r) => [r.id, r.title]));
  const pendingApps = input.applications.filter((a) => a.stage === "New" || a.stage === "Reviewed");

  return {
    platform: {
      name: PLATFORM_NAME,
      institution: INSTITUTION_NAME,
      coordinatorName: input.coordinatorName,
    },
    stats: input.adminStats,
    topSkills: input.skillDistribution.slice(0, 10),
    recentActivity: input.activity.slice(0, 10),
    students: input.students.map((s) => ({
      id: s.id,
      name: s.name,
      className: s.className,
      skills: s.skills,
      interests: s.interests,
      availability: s.availability,
      status: s.status,
    })),
    pendingIdeas: input.pendingIdeas.map((i) => ({
      id: i.id,
      title: i.title,
      category: i.category,
      creatorId: i.creatorId,
    })),
    projects: input.projects.map((p) => ({
      id: p.id,
      title: p.title,
      status: p.status,
      progress: p.progress,
      memberCount: p.memberIds.length,
      deadline: p.deadline,
    })),
    recruitments: input.recruitments.map((r) => ({
      id: r.id,
      title: r.title,
      status: r.status,
      skills: r.skills,
      closes: r.closes,
      applications: r.applications,
    })),
    pendingApplications: pendingApps.slice(0, 15).map((a) => ({
      id: a.id,
      studentId: a.studentId,
      recruitmentTitle: recruitmentTitles.get(a.recruitmentId) ?? a.recruitmentId,
      stage: a.stage,
    })),
    openReports: input.reports
      .filter((r) => r.status === "Open" || r.status === "Reviewing")
      .slice(0, 10)
      .map((r) => ({
        id: r.id,
        target: r.target,
        kind: r.kind,
        status: r.status,
      })),
    upcomingEvents: input.events.slice(0, 8).map((e) => ({
      id: e.id,
      title: e.title,
      date: e.date,
      place: e.place,
    })),
    opportunities: input.opportunities.slice(0, 8).map((o) => ({
      id: o.id,
      title: o.title,
      type: o.type,
      deadline: o.deadline,
    })),
  };
}

export const QUICK_PROMPTS = [
  "What should I prioritize on the platform today?",
  "Hello!",
  "Recommend a team for an AI and robotics competition project.",
  "Which active students have both coding and hardware skills?",
  "Summarize pending idea reviews and suggest next steps.",
  "Draft a short recruitment post for a drone innovation team.",
  "Give me an overview of open reports and recommended actions.",
] as const;

const STORAGE_KEY = "aavishkar-admin-assistant-v1";

export function loadStoredMessages(): AssistantMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AssistantMessage[];
    return Array.isArray(parsed) ? parsed.slice(-40) : [];
  } catch {
    return [];
  }
}

export function storeMessages(messages: AssistantMessage[]) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-40)));
  } catch {
    /* ignore quota errors */
  }
}

export function clearStoredMessages() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}

export type MarkdownLine =
  | { key: number; type: "break" }
  | { key: number; type: "bullet"; text: string }
  | { key: number; type: "numbered"; text: string }
  | { key: number; type: "paragraph"; text: string };

export function parseAssistantMarkdown(text: string): MarkdownLine[] {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return { key: i, type: "break" as const };
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      return { key: i, type: "bullet" as const, text: trimmed.slice(2) };
    }
    if (/^\d+\.\s/.test(trimmed)) {
      return {
        key: i,
        type: "numbered" as const,
        text: trimmed.replace(/^\d+\.\s/, ""),
      };
    }
    return { key: i, type: "paragraph" as const, text: trimmed };
  });
}

export function splitInlineMarkdown(text: string): { bold?: boolean; code?: boolean; text: string }[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);
  return parts.map((part) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return { bold: true, text: part.slice(2, -2) };
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return { code: true, text: part.slice(1, -1) };
    }
    return { text: part };
  });
}
