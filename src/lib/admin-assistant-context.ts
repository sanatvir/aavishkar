import type {
  Application,
  Community,
  CommunityJoinApplication,
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
import { QUICK_PROMPT_SUGGESTIONS } from "@/lib/admin-assistant-voice";

export const ALL_PROVIDERS_RATE_LIMITED =
  "All AI providers are rate-limited right now. **Try again in a while.**";

export const ASSISTANT_SERVER_UNAVAILABLE =
  "I couldn't reach the assistant server right now. Try again in a moment.";

function asString(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (value == null) return fallback;
  return String(value);
}

/** Coerce nullable DB / client fields before API validation. */
export function sanitizePlatformContext(raw: PlatformContext): PlatformContext {
  return {
    snapshotAt: asString(raw.snapshotAt, new Date().toISOString()),
    platform: {
      name: asString(raw.platform?.name, PLATFORM_NAME),
      institution: asString(raw.platform?.institution, INSTITUTION_NAME),
      coordinatorName: asString(raw.platform?.coordinatorName, "Coordinator"),
    },
    stats: (raw.stats ?? []).map((item) => ({
      label: asString(item.label),
      value: typeof item.value === "number" && Number.isFinite(item.value) ? item.value : 0,
      delta: asString(item.delta),
    })),
    topSkills: (raw.topSkills ?? []).map((item) => ({
      skill: asString(item.skill),
      students: typeof item.students === "number" && Number.isFinite(item.students) ? item.students : 0,
    })),
    recentActivity: (raw.recentActivity ?? []).map((item) => ({
      text: asString(item.text),
      time: asString(item.time),
    })),
    students: (raw.students ?? []).map((student) => ({
      id: asString(student.id),
      name: asString(student.name),
      className: asString(student.className),
      skills: (student.skills ?? []).map((skill) => asString(skill)).filter(Boolean),
      interests: (student.interests ?? []).map((interest) => asString(interest)).filter(Boolean),
      availability: student.availability ?? "Available",
      status: student.status ?? "Active",
    })),
    pendingIdeas: (raw.pendingIdeas ?? []).map((idea) => ({
      id: asString(idea.id),
      title: asString(idea.title),
      category: asString(idea.category),
      creatorId: asString(idea.creatorId),
    })),
    projects: (raw.projects ?? []).map((project) => ({
      id: asString(project.id),
      title: asString(project.title),
      status: project.status ?? "Planning",
      progress: typeof project.progress === "number" && Number.isFinite(project.progress) ? project.progress : 0,
      memberCount:
        typeof project.memberCount === "number" && Number.isFinite(project.memberCount)
          ? project.memberCount
          : 0,
      deadline: asString(project.deadline),
    })),
    recruitments: (raw.recruitments ?? []).map((recruitment) => ({
      id: asString(recruitment.id),
      title: asString(recruitment.title),
      status: recruitment.status ?? "Applications Open",
      skills: (recruitment.skills ?? []).map((skill) => asString(skill)).filter(Boolean),
      closes: asString(recruitment.closes),
      applications:
        typeof recruitment.applications === "number" && Number.isFinite(recruitment.applications)
          ? recruitment.applications
          : 0,
    })),
    pendingApplications: (raw.pendingApplications ?? []).map((application) => ({
      id: asString(application.id),
      studentId: asString(application.studentId),
      recruitmentTitle: asString(application.recruitmentTitle),
      stage: application.stage ?? "New",
    })),
    openReports: (raw.openReports ?? []).map((report) => ({
      id: asString(report.id),
      target: asString(report.target),
      kind: report.kind ?? "User",
      status: report.status ?? "Open",
    })),
    upcomingEvents: (raw.upcomingEvents ?? []).map((event) => ({
      id: asString(event.id),
      title: asString(event.title),
      date: asString(event.date),
      place: asString(event.place),
    })),
    opportunities: (raw.opportunities ?? []).map((opportunity) => ({
      id: asString(opportunity.id),
      title: asString(opportunity.title),
      type: asString(opportunity.type),
      deadline: asString(opportunity.deadline),
    })),
    communities: (raw.communities ?? []).map((community) => ({
      id: asString(community.id),
      name: asString(community.name),
      memberCount:
        typeof community.memberCount === "number" && Number.isFinite(community.memberCount)
          ? community.memberCount
          : 0,
      memberIds: (community.memberIds ?? []).map((id) => asString(id)).filter(Boolean),
      recentActivity: (community.recentActivity ?? []).map((line) => asString(line)).filter(Boolean),
      pendingJoinApplications:
        typeof community.pendingJoinApplications === "number" &&
        Number.isFinite(community.pendingJoinApplications)
          ? community.pendingJoinApplications
          : 0,
    })),
  };
}

export type AssistantSource = "groq" | "openai" | "nvidia";

export type AdminAssistantInput = {
  messages: { role: "user" | "assistant"; content: string }[];
  context: PlatformContext;
};

export type AdminAssistantResult = {
  reply: string;
  teamRecommendations: { studentId: string; reason: string }[];
  suggestedFollowUps: string[];
  source?: AssistantSource;
  errorKind?: "quota" | "auth" | "rate_limit" | "network" | "unknown";
};

export type AssistantMessage = {
  role: "user" | "assistant";
  content: string;
  teamRecommendations?: { studentId: string; reason: string }[];
  suggestedFollowUps?: string[];
  source?: "groq" | "openai" | "nvidia";
  errorKind?: "quota" | "auth" | "rate_limit" | "network" | "unknown";
};

export type PlatformContext = {
  snapshotAt: string;
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
  communities: {
    id: string;
    name: string;
    memberCount: number;
    memberIds: string[];
    recentActivity: string[];
    pendingJoinApplications: number;
  }[];
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
  communities: Community[];
  communityMembers: Record<string, string[]>;
  communityJoinApplications: CommunityJoinApplication[];
}): PlatformContext {
  const recruitmentTitles = new Map(input.recruitments.map((r) => [r.id, r.title]));
  const pendingApps = input.applications.filter((a) => a.stage === "New" || a.stage === "Reviewed");
  const pendingCommunityApps = input.communityJoinApplications.filter((a) => a.status === "Pending");

  const context: PlatformContext = {
    snapshotAt: new Date().toISOString(),
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
      deadline: p.deadline ?? "",
    })),
    recruitments: input.recruitments.map((r) => ({
      id: r.id,
      title: r.title,
      status: r.status,
      skills: r.skills,
      closes: r.closes ?? "",
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
      deadline: o.deadline ?? "",
    })),
    communities: input.communities.map((c) => {
      const memberIds = input.communityMembers[c.id] ?? [];
      return {
        id: c.id,
        name: c.name,
        memberCount: memberIds.length,
        memberIds,
        recentActivity: c.activity.slice(0, 3),
        pendingJoinApplications: pendingCommunityApps.filter((a) => a.communityId === c.id).length,
      };
    }),
  };

  return sanitizePlatformContext(context);
}

export const QUICK_PROMPTS = QUICK_PROMPT_SUGGESTIONS;

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
