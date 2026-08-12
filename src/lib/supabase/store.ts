import { INSTITUTION_NAME, PLATFORM_NAME } from "../brand";
import {
  adminActivity,
  adminEvents,
  communities as seedCommunities,
  opportunities as seedOpportunities,
  seedApplications,
  seedConversations,
  seedIdeas,
  seedNotifications,
  seedProjects,
  seedRecruitments,
  seedReports,
  students as seedStudents,
  seedCommunityMembers,
  type Community,
  type Conversation,
  type Notification,
  type Project,
  type Student,
} from "../mock-data";
import { isDemoSeedEnabled } from "../env";
import type {
  Application,
  Idea,
  NewEvent,
  NewOpportunity,
  NewRecruitment,
  NewReport,
  Opportunity,
  Recruitment,
  Report,
  CommunityJoinApplication,
  CommunityPost,
} from "../types";
import { isSupabaseConfigured, supabase } from "./client";

export type PlatformEvent = {
  id: string;
  title: string;
  date: string;
  place: string;
  seats: string;
};

export type StudentSettings = {
  showInDiscover: boolean;
  showClass: boolean;
  allowMessages: boolean;
  showProjectsPublic: boolean;
  notifyConnections: boolean;
  notifyProjects: boolean;
  notifyOpportunities: boolean;
  notifyCommunities: boolean;
};

export const defaultStudentSettings = (): StudentSettings => ({
  showInDiscover: true,
  showClass: true,
  allowMessages: true,
  showProjectsPublic: false,
  notifyConnections: true,
  notifyProjects: true,
  notifyOpportunities: true,
  notifyCommunities: false,
});

export type PlatformSettings = {
  platformName: string;
  institution: string;
  coordinatorName: string;
  coordinatorAvatarUrl?: string;
  restrictSignin: boolean;
  allowStudentProjects: boolean;
  coordinatorsCloseRecruitments: boolean;
  teachersPublishOpportunities: boolean;
  studentLeadsCommunities: boolean;
  autoFlagConnections: boolean;
  requireIdeaReview: boolean;
  deadlineReminders: boolean;
  weeklyDigest: boolean;
  recruitmentAlerts: boolean;
};

export type ActivityItem = { text: string; time: string };

export type PublicStats = {
  students: number;
  ideas: number;
  projects: number;
};

export type AppDataSnapshot = {
  students: Student[];
  communities: Community[];
  opportunities: Opportunity[];
  connections: string[];
  joinedCommunities: string[];
  ideas: Idea[];
  supported: string[];
  joinedIdeas: string[];
  projects: Project[];
  projectCreatedAt: Map<string, string>;
  conversations: Conversation[];
  notifications: Notification[];
  savedOpportunities: string[];
  registeredOpportunities: string[];
  shortlist: string[];
  recruitments: Recruitment[];
  applications: Application[];
  reports: Report[];
  events: PlatformEvent[];
  activity: ActivityItem[];
  studentSettings: StudentSettings;
  platformSettings: PlatformSettings;
  discoverHiddenIds: string[];
  communityMembers: Record<string, string[]>;
  communityJoinApplications: CommunityJoinApplication[];
  communityPosts: CommunityPost[];
};

const seedCommunityExtras = new Map(
  seedCommunities.map((c) => [c.id, { sessions: c.sessions, resources: c.resources }]),
);

const pairKey = (a: string, b: string) => (a < b ? [a, b] : [b, a]);

const formatTime = (iso: string) => {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const mapStudent = (row: {
  id: string;
  name: string;
  class_name: string;
  initials: string;
  bio: string;
  skills: string[];
  interests: string[];
  availability: string;
  projects: string[];
  achievements: string[];
  status: string;
  accent: string;
  avatar_url?: string | null;
  created_at?: string;
}): Student => ({
  id: row.id,
  name: row.name,
  className: row.class_name,
  initials: row.initials,
  bio: row.bio,
  skills: row.skills ?? [],
  interests: row.interests ?? [],
  availability: row.availability as Student["availability"],
  projects: row.projects ?? [],
  achievements: row.achievements ?? [],
  status: row.status as Student["status"],
  accent: row.accent,
  avatarUrl: row.avatar_url ?? undefined,
  createdAt: row.created_at,
});

const mapEvent = (row: {
  id: string;
  title: string;
  event_date: string;
  place: string;
  seats_total: number | null;
  seats_filled: number;
}): PlatformEvent => ({
  id: row.id,
  title: row.title,
  date: row.event_date,
  place: row.place,
  seats:
    row.seats_total == null
      ? "—"
      : row.seats_filled >= row.seats_total
        ? `${row.seats_total} / ${row.seats_total}`
        : `${row.seats_filled} / ${row.seats_total}`,
});

const mapStudentSettings = (row: {
  show_in_discover: boolean;
  show_class: boolean;
  allow_messages: boolean;
  show_projects_public: boolean;
  notify_connections: boolean;
  notify_projects: boolean;
  notify_opportunities: boolean;
  notify_communities: boolean;
}): StudentSettings => ({
  showInDiscover: row.show_in_discover,
  showClass: row.show_class,
  allowMessages: row.allow_messages,
  showProjectsPublic: row.show_projects_public,
  notifyConnections: row.notify_connections,
  notifyProjects: row.notify_projects,
  notifyOpportunities: row.notify_opportunities,
  notifyCommunities: row.notify_communities,
});

const mapPlatformSettings = (row: {
  platform_name: string;
  institution: string;
  coordinator_name?: string | null;
  coordinator_avatar_url?: string | null;
  restrict_signin: boolean;
  allow_student_projects: boolean;
  coordinators_close_recruitments: boolean;
  teachers_publish_opportunities: boolean;
  student_leads_communities: boolean;
  auto_flag_connections: boolean;
  require_idea_review: boolean;
  deadline_reminders: boolean;
  weekly_digest: boolean;
  recruitment_alerts: boolean;
}): PlatformSettings => ({
  platformName: PLATFORM_NAME,
  institution: INSTITUTION_NAME,
  coordinatorName: row.coordinator_name ?? "ATL Coordinator",
  coordinatorAvatarUrl: row.coordinator_avatar_url ?? undefined,
  restrictSignin: row.restrict_signin,
  allowStudentProjects: row.allow_student_projects,
  coordinatorsCloseRecruitments: row.coordinators_close_recruitments,
  teachersPublishOpportunities: row.teachers_publish_opportunities,
  studentLeadsCommunities: row.student_leads_communities,
  autoFlagConnections: row.auto_flag_connections,
  requireIdeaReview: row.require_idea_review,
  deadlineReminders: row.deadline_reminders,
  weeklyDigest: row.weekly_digest,
  recruitmentAlerts: row.recruitment_alerts,
});

const defaultPlatformSettings = (): PlatformSettings => ({
  platformName: PLATFORM_NAME,
  institution: INSTITUTION_NAME,
  coordinatorName: "ATL Coordinator",
  restrictSignin: true,
  allowStudentProjects: true,
  coordinatorsCloseRecruitments: true,
  teachersPublishOpportunities: false,
  studentLeadsCommunities: true,
  autoFlagConnections: true,
  requireIdeaReview: false,
  deadlineReminders: true,
  weeklyDigest: true,
  recruitmentAlerts: true,
});

async function ensureLiveDataSeeded() {
  try {
    const { count: eventCount } = await supabase
      .from("events")
      .select("*", { count: "exact", head: true });
    if (!eventCount) {
      await supabase.from("events").insert(
        adminEvents.map((e, i) => {
          const match = e.seats.match(/(\d+)\s*\/\s*(\d+)/);
          const filled = match ? Number(match[1]) : 0;
          const total = match ? Number(match[2]) : null;
          return {
            id: `event-${i + 1}`,
            title: e.title,
            event_date: e.date,
            place: e.place,
            seats_total: total,
            seats_filled: filled,
          };
        }),
      );
    }

    const { count: activityCount } = await supabase
      .from("activity_log")
      .select("*", { count: "exact", head: true });
    if (!activityCount) {
      await supabase.from("activity_log").insert(
        adminActivity.map((a) => ({
          text: a.text,
          created_at: new Date(Date.now() - Math.random() * 86_400_000 * 3).toISOString(),
        })),
      );
    }

    await supabase.from("platform_settings").upsert({ id: "default" });
  } catch (err) {
    console.warn("[AAVISHKAR] Live data tables missing — run supabase/002_live_data.sql", err);
  }
}

export async function ensureSeeded() {
  if (!isSupabaseConfigured || !isDemoSeedEnabled) return;

  await ensureLiveDataSeeded();

  const { count } = await supabase.from("students").select("*", { count: "exact", head: true });
  if (count && count > 0) return;

  await supabase.from("students").insert(
    seedStudents.map((s) => ({
      id: s.id,
      name: s.name,
      class_name: s.className,
      initials: s.initials,
      bio: s.bio,
      skills: s.skills,
      interests: s.interests,
      availability: s.availability,
      projects: s.projects,
      achievements: s.achievements,
      status: s.status,
      accent: s.accent,
      role: "student",
    })),
  );

  await supabase.from("ideas").insert(
    seedIdeas.map((i) => ({
      id: i.id,
      title: i.title,
      category: i.category,
      problem: i.problem,
      solution: i.solution,
      why: i.why,
      looking_for: i.lookingFor,
      technologies: i.technologies,
      creator_id: i.creatorId,
      supports: i.supports,
      collaborators: i.collaborators,
    })),
  );

  const comments = seedIdeas.flatMap((i) =>
    i.comments.map((c) => ({
      id: `${i.id}-${c.id}`,
      idea_id: i.id,
      author_id: c.authorId,
      text: c.text,
    })),
  );
  if (comments.length) await supabase.from("idea_comments").insert(comments);

  const members = seedIdeas.flatMap((i) =>
    i.interested.map((studentId) => ({ idea_id: i.id, student_id: studentId })),
  );
  if (members.length) await supabase.from("idea_members").insert(members);

  await supabase.from("projects").insert(
    seedProjects.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      status: p.status,
      progress: p.progress,
      member_ids: p.memberIds,
      deadline: p.deadline,
      milestones: p.milestones,
      tasks: p.tasks,
      files: p.files,
      updates: p.updates,
      chat: p.chat,
      mine: p.mine,
    })),
  );

  await supabase.from("communities").insert(
    seedCommunities.map((c) => ({
      id: c.id,
      name: c.name,
      members: c.members,
      description: c.description,
      activity: c.activity,
      accent: c.accent,
    })),
  );

  await supabase.from("opportunities").insert(
    seedOpportunities.map((o) => ({
      id: o.id,
      title: o.title,
      type: o.type,
      deadline: o.deadline,
      description: o.description,
      eligibility: o.eligibility,
      skills: o.skills,
      organizer: o.organizer,
    })),
  );

  await supabase.from("recruitments").insert(seedRecruitments);
  await supabase.from("applications").insert(
    seedApplications.map((a) => ({
      id: a.id,
      student_id: a.studentId,
      recruitment_id: a.recruitmentId,
      submitted: a.submitted,
      note: a.note,
      stage: a.stage,
    })),
  );
  await supabase.from("reports").insert(seedReports);

  const demoId = "sanatvir";
  await supabase.from("connections").insert(
    ["shaurya", "tanvi", "rehan", "ananya"].map((connected_id) => ({
      student_id: demoId,
      connected_id,
    })),
  );
  await supabase.from("community_members").insert(
    Object.entries(seedCommunityMembers).flatMap(([community_id, ids]) =>
      ids.map((student_id) => ({ community_id, student_id })),
    ),
  );
  await supabase.from("idea_supporters").insert({ idea_id: "campus-air-map", student_id: demoId });

  for (const conv of seedConversations) {
    const [a, b] = pairKey(demoId, conv.withId);
    await supabase.from("conversations").insert({ id: conv.id, participant_a: a, participant_b: b });
    const rows = conv.messages.map((m, idx) => ({
      conversation_id: conv.id,
      sender_id: m.fromMe ? demoId : conv.withId,
      text: m.text,
      created_at: new Date(Date.now() - (conv.messages.length - idx) * 60_000).toISOString(),
    }));
    await supabase.from("messages").insert(rows);
    await supabase.from("conversation_reads").insert({
      conversation_id: conv.id,
      student_id: demoId,
      unread_count: conv.unread,
    });
  }

  await supabase.from("notifications").insert(
    seedNotifications.map((n) => ({
      id: n.id,
      student_id: demoId,
      kind: n.kind,
      text: n.text,
      read: n.read,
    })),
  );
}

export async function loadAppData(userId: string): Promise<AppDataSnapshot | null> {
  if (!isSupabaseConfigured) return null;

  const [
    studentsRes,
    communitiesRes,
    opportunitiesRes,
    ideasRes,
    commentsRes,
    supportersRes,
    membersRes,
    projectsRes,
    connectionsRes,
    communityMembersRes,
    convosRes,
    messagesRes,
    readsRes,
    notificationsRes,
    savedRes,
    shortlistRes,
    recruitmentsRes,
    applicationsRes,
    reportsRes,
    eventsRes,
    activityRes,
    studentSettingsRes,
    platformSettingsRes,
    allSettingsRes,
    registrationsRes,
    communityMembersAllRes,
    joinAppsRes,
    communityPostsRes,
  ] = await Promise.all([
    supabase.from("students").select("*").order("name"),
    supabase.from("communities").select("*").order("name"),
    supabase.from("opportunities").select("*").order("title"),
    supabase.from("ideas").select("*"),
    supabase.from("idea_comments").select("*"),
    supabase.from("idea_supporters").select("*").eq("student_id", userId),
    supabase.from("idea_members").select("*").eq("student_id", userId),
    supabase.from("projects").select("*"),
    supabase.from("connections").select("connected_id").eq("student_id", userId),
    supabase.from("community_members").select("community_id").eq("student_id", userId),
    supabase.from("conversations").select("*").or(`participant_a.eq.${userId},participant_b.eq.${userId}`),
    supabase.from("messages").select("*").order("created_at"),
    supabase.from("conversation_reads").select("*").eq("student_id", userId),
    supabase.from("notifications").select("*").eq("student_id", userId).order("created_at", { ascending: false }),
    supabase.from("saved_opportunities").select("opportunity_id").eq("student_id", userId),
    supabase.from("admin_shortlist").select("student_id"),
    supabase.from("recruitments").select("*"),
    supabase.from("applications").select("*"),
    supabase.from("reports").select("*"),
    supabase.from("events").select("*").order("event_date"),
    supabase.from("activity_log").select("*").order("created_at", { ascending: false }).limit(12),
    supabase.from("student_settings").select("*").eq("student_id", userId).maybeSingle(),
    supabase.from("platform_settings").select("*").eq("id", "default").maybeSingle(),
    supabase.from("student_settings").select("student_id, show_in_discover"),
    supabase.from("opportunity_registrations").select("opportunity_id").eq("student_id", userId),
    supabase.from("community_members").select("community_id"),
    supabase.from("community_join_applications").select("*"),
    supabase.from("community_posts").select("*").order("created_at", { ascending: false }),
  ]);

  const events: PlatformEvent[] = eventsRes.error
    ? []
    : (eventsRes.data ?? []).map(mapEvent);
  const activity: ActivityItem[] = activityRes.error
    ? []
    : (activityRes.data ?? []).map((a) => ({
        text: a.text,
        time: formatTime(a.created_at),
      }));

  const discoverHiddenIds = allSettingsRes.error
    ? []
    : (allSettingsRes.data ?? [])
        .filter((s) => s.show_in_discover === false)
        .map((s) => s.student_id);

  const commentsByIdea = new Map<string, Idea["comments"]>();
  for (const c of commentsRes.data ?? []) {
    const list = commentsByIdea.get(c.idea_id) ?? [];
    list.push({
      id: c.id,
      authorId: c.author_id,
      text: c.text,
      time: formatTime(c.created_at),
    });
    commentsByIdea.set(c.idea_id, list);
  }

  const interestedByIdea = new Map<string, string[]>();
  const { data: allMembers } = await supabase.from("idea_members").select("*");
  for (const m of allMembers ?? []) {
    const list = interestedByIdea.get(m.idea_id) ?? [];
    list.push(m.student_id);
    interestedByIdea.set(m.idea_id, list);
  }

  const communityMemberCounts = new Map<string, number>();
  const communityMembersMap: Record<string, string[]> = {};
  for (const m of communityMembersAllRes.data ?? []) {
    communityMemberCounts.set(m.community_id, (communityMemberCounts.get(m.community_id) ?? 0) + 1);
    const list = communityMembersMap[m.community_id] ?? [];
    list.push(m.student_id);
    communityMembersMap[m.community_id] = list;
  }

  const ideas: Idea[] = (ideasRes.data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    category: row.category,
    problem: row.problem,
    solution: row.solution,
    why: row.why,
    lookingFor: row.looking_for ?? [],
    technologies: row.technologies ?? [],
    creatorId: row.creator_id,
    supports: row.supports,
    collaborators: row.collaborators,
    interested: interestedByIdea.get(row.id) ?? [],
    comments: commentsByIdea.get(row.id) ?? [],
    reviewStatus: (row as { review_status?: string }).review_status === "pending" ? "pending" : "published",
  }));

  const projectCreatedAt = new Map<string, string>();
  const projects: Project[] = (projectsRes.data ?? []).map((row) => {
    if (row.created_at) projectCreatedAt.set(row.id, row.created_at);
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      status: row.status,
      progress: row.progress,
      memberIds: row.member_ids ?? [],
      deadline: row.deadline ?? "",
      milestones: row.milestones ?? [],
      tasks: row.tasks ?? [],
      files: row.files ?? [],
      updates: row.updates ?? [],
      chat: row.chat ?? [],
      mine: (row.member_ids ?? []).includes(userId),
    };
  });

  const communityJoinApplications: CommunityJoinApplication[] = joinAppsRes.error
    ? []
    : (joinAppsRes.data ?? []).map((row) => ({
        id: row.id,
        studentId: row.student_id,
        communityId: row.community_id,
        submitted: row.submitted,
        note: row.note ?? "",
        status: row.status as CommunityJoinApplication["status"],
      }));

  const communityPosts: CommunityPost[] = communityPostsRes.error
    ? []
    : (communityPostsRes.data ?? []).map((row) => ({
        id: row.id,
        communityId: row.community_id,
        authorId: row.author_id,
        text: row.text,
        time: formatTime(row.created_at),
      }));

  const reads = new Map((readsRes.data ?? []).map((r) => [r.conversation_id, r.unread_count]));
  const msgsByConvo = new Map<string, typeof messagesRes.data>();
  for (const m of messagesRes.data ?? []) {
    const list = msgsByConvo.get(m.conversation_id) ?? [];
    list.push(m);
    msgsByConvo.set(m.conversation_id, list);
  }

  const conversations: Conversation[] = (convosRes.data ?? []).map((c) => {
    const withId = c.participant_a === userId ? c.participant_b : c.participant_a;
    const msgs = msgsByConvo.get(c.id) ?? [];
    return {
      id: withId,
      withId,
      unread: reads.get(c.id) ?? 0,
      messages: msgs.map((m) => ({
        fromMe: m.sender_id === userId,
        text: m.text,
        time: new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      })),
    };
  });

  const notifications: Notification[] = (notificationsRes.data ?? []).map((n) => ({
    id: n.id,
    kind: n.kind,
    text: n.text,
    time: formatTime(n.created_at),
    read: n.read,
  }));

  const activityFromLog = activity;

  return {
    students: (studentsRes.data ?? []).map(mapStudent),
    communities: (communitiesRes.data ?? []).map((c) => {
      const extras = seedCommunityExtras.get(c.id);
      return {
        id: c.id,
        name: c.name,
        members: communityMemberCounts.get(c.id) ?? c.members,
        description: c.description,
        activity: c.activity ?? [],
        accent: c.accent,
        sessions: extras?.sessions ?? [],
        resources: extras?.resources ?? [],
      };
    }),
    opportunities: (opportunitiesRes.data ?? []) as Opportunity[],
    connections: (connectionsRes.data ?? []).map((c) => c.connected_id),
    joinedCommunities: (communityMembersRes.data ?? []).map((c) => c.community_id),
    ideas,
    supported: (supportersRes.data ?? []).map((s) => s.idea_id),
    joinedIdeas: (membersRes.data ?? []).map((m) => m.idea_id),
    projects,
    projectCreatedAt,
    conversations,
    notifications,
    savedOpportunities: (savedRes.data ?? []).map((s) => s.opportunity_id),
    registeredOpportunities: registrationsRes.error
      ? []
      : (registrationsRes.data ?? []).map((r) => r.opportunity_id),
    shortlist: (shortlistRes.data ?? []).map((s) => s.student_id),
    recruitments: (recruitmentsRes.data ?? []) as Recruitment[],
    applications: (applicationsRes.data ?? []).map((a) => ({
      id: a.id,
      studentId: a.student_id,
      recruitmentId: a.recruitment_id,
      submitted: a.submitted,
      note: a.note,
      stage: a.stage,
    })),
    reports: (reportsRes.data ?? []).map((row) => ({
      id: row.id,
      target: row.target,
      targetId: (row as { target_id?: string }).target_id,
      kind: row.kind as Report["kind"],
      reason: row.reason,
      date: row.date,
      status: row.status as Report["status"],
    })),
    events,
    activity: activityFromLog,
    studentSettings: studentSettingsRes.data
      ? mapStudentSettings(studentSettingsRes.data)
      : defaultStudentSettings(),
    platformSettings: platformSettingsRes.data
      ? mapPlatformSettings(platformSettingsRes.data)
      : defaultPlatformSettings(),
    discoverHiddenIds,
    communityMembers: communityMembersMap,
    communityJoinApplications,
    communityPosts,
  };
}

export async function syncConnection(userId: string, connectedId: string, connected: boolean) {
  if (!isSupabaseConfigured) return;
  if (connected) {
    await supabase.from("connections").insert({ student_id: userId, connected_id: connectedId });
  } else {
    await supabase.from("connections").delete().eq("student_id", userId).eq("connected_id", connectedId);
  }
}

export async function syncCommunity(userId: string, communityId: string, joined: boolean) {
  if (!isSupabaseConfigured) return;
  if (joined) {
    await supabase.from("community_members").insert({ student_id: userId, community_id: communityId });
  } else {
    await supabase.from("community_members").delete().eq("student_id", userId).eq("community_id", communityId);
  }
  const { count } = await supabase
    .from("community_members")
    .select("*", { count: "exact", head: true })
    .eq("community_id", communityId);
  await supabase.from("communities").update({ members: count ?? 0 }).eq("id", communityId);
}

export async function syncIdeaSupport(userId: string, ideaId: string, supported: boolean, supports: number) {
  if (!isSupabaseConfigured) return;
  if (supported) {
    await supabase.from("idea_supporters").insert({ student_id: userId, idea_id: ideaId });
  } else {
    await supabase.from("idea_supporters").delete().eq("student_id", userId).eq("idea_id", ideaId);
  }
  await supabase.from("ideas").update({ supports }).eq("id", ideaId);
}

export async function syncJoinIdea(userId: string, idea: Idea) {
  if (!isSupabaseConfigured) return;
  await supabase.from("idea_members").insert({ student_id: userId, idea_id: idea.id });
  await supabase
    .from("ideas")
    .update({ collaborators: idea.collaborators, supports: idea.supports })
    .eq("id", idea.id);
}

export async function insertIdea(idea: Idea, reviewStatus: Idea["reviewStatus"] = "published") {
  if (!isSupabaseConfigured) return;
  await supabase.from("ideas").insert({
    id: idea.id,
    title: idea.title,
    category: idea.category,
    problem: idea.problem,
    solution: idea.solution,
    why: idea.why,
    looking_for: idea.lookingFor,
    technologies: idea.technologies,
    creator_id: idea.creatorId,
    supports: idea.supports,
    collaborators: idea.collaborators,
    review_status: reviewStatus ?? "published",
  });
  if (reviewStatus !== "pending") {
    await supabase.from("idea_supporters").insert({ student_id: idea.creatorId, idea_id: idea.id });
  }
}

export async function insertIdeaComment(ideaId: string, comment: Idea["comments"][number]) {
  if (!isSupabaseConfigured) return;
  await supabase.from("idea_comments").insert({
    id: comment.id,
    idea_id: ideaId,
    author_id: comment.authorId,
    text: comment.text,
  });
}

export async function upsertProject(project: Project) {
  if (!isSupabaseConfigured) return;
  await supabase.from("projects").upsert({
    id: project.id,
    title: project.title,
    description: project.description,
    status: project.status,
    progress: project.progress,
    member_ids: project.memberIds,
    deadline: project.deadline,
    milestones: project.milestones,
    tasks: project.tasks,
    files: project.files,
    updates: project.updates,
    chat: project.chat,
    mine: project.mine,
  });
}

export async function syncSavedOpportunity(userId: string, opportunityId: string, saved: boolean) {
  if (!isSupabaseConfigured) return;
  if (saved) {
    await supabase.from("saved_opportunities").insert({ student_id: userId, opportunity_id: opportunityId });
  } else {
    await supabase
      .from("saved_opportunities")
      .delete()
      .eq("student_id", userId)
      .eq("opportunity_id", opportunityId);
  }
}

export async function syncShortlist(studentId: string, shortlisted: boolean) {
  if (!isSupabaseConfigured) return;
  if (shortlisted) {
    await supabase.from("admin_shortlist").insert({ student_id: studentId });
  } else {
    await supabase.from("admin_shortlist").delete().eq("student_id", studentId);
  }
}

export async function syncShortlistMany(ids: string[]) {
  if (!isSupabaseConfigured) return;
  await supabase.from("admin_shortlist").upsert(ids.map((student_id) => ({ student_id })));
}

export async function syncRecruitmentStatus(id: string, status: Recruitment["status"]) {
  if (!isSupabaseConfigured) return;
  await supabase.from("recruitments").update({ status }).eq("id", id);
}

export async function syncApplicationStage(id: string, stage: Application["stage"]) {
  if (!isSupabaseConfigured) return;
  await supabase.from("applications").update({ stage }).eq("id", id);
}

export async function syncReportStatus(id: string, status: Report["status"]) {
  if (!isSupabaseConfigured) return;
  await supabase.from("reports").update({ status }).eq("id", id);
}

export async function syncNotificationsRead(userId: string) {
  if (!isSupabaseConfigured) return;
  await supabase.from("notifications").update({ read: true }).eq("student_id", userId);
}

export async function deleteNotification(id: string) {
  if (!isSupabaseConfigured) return;
  await supabase.from("notifications").delete().eq("id", id);
}

export async function syncConversationRead(conversationId: string, userId: string) {
  if (!isSupabaseConfigured) return;
  await supabase
    .from("conversation_reads")
    .upsert({ conversation_id: conversationId, student_id: userId, unread_count: 0 });
}

export async function insertMessage(
  userId: string,
  withId: string,
  text: string,
  conversationId: string,
) {
  if (!isSupabaseConfigured) return conversationId;
  const [a, b] = pairKey(userId, withId);
  const id = withId;
  await supabase.from("conversations").upsert({ id, participant_a: a, participant_b: b });
  await supabase.from("messages").insert({
    conversation_id: id,
    sender_id: userId,
    text,
  });
  return id;
}

export async function updateStudent(student: Student) {
  if (!isSupabaseConfigured) return;
  await supabase
    .from("students")
    .update({
      name: student.name,
      class_name: student.className,
      bio: student.bio,
      skills: student.skills,
      avatar_url: student.avatarUrl ?? null,
    })
    .eq("id", student.id);
}

export async function updateStudentAvatar(studentId: string, avatarUrl: string | null) {
  if (!isSupabaseConfigured) return;
  await supabase.from("students").update({ avatar_url: avatarUrl }).eq("id", studentId);
}

export async function insertNotification(
  studentId: string,
  kind: Notification["kind"],
  text: string,
): Promise<Notification | null> {
  if (!isSupabaseConfigured) return null;
  const id = `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  await supabase.from("notifications").insert({
    id,
    student_id: studentId,
    kind,
    text,
    read: false,
  });
  return { id, kind, text, time: "just now", read: false };
}

export async function logActivity(text: string) {
  if (!isSupabaseConfigured) return;
  await supabase.from("activity_log").insert({ text });
}

export async function syncStudentSettings(studentId: string, settings: StudentSettings) {
  if (!isSupabaseConfigured) return;
  await supabase.from("student_settings").upsert({
    student_id: studentId,
    show_in_discover: settings.showInDiscover,
    show_class: settings.showClass,
    allow_messages: settings.allowMessages,
    show_projects_public: settings.showProjectsPublic,
    notify_connections: settings.notifyConnections,
    notify_projects: settings.notifyProjects,
    notify_opportunities: settings.notifyOpportunities,
    notify_communities: settings.notifyCommunities,
  });
}

export async function syncPlatformSettings(settings: PlatformSettings) {
  if (!isSupabaseConfigured) return;
  await supabase.from("platform_settings").upsert({
    id: "default",
    platform_name: PLATFORM_NAME,
    institution: INSTITUTION_NAME,
    coordinator_name: settings.coordinatorName,
    coordinator_avatar_url: settings.coordinatorAvatarUrl ?? null,
    restrict_signin: settings.restrictSignin,
    allow_student_projects: settings.allowStudentProjects,
    coordinators_close_recruitments: settings.coordinatorsCloseRecruitments,
    teachers_publish_opportunities: settings.teachersPublishOpportunities,
    student_leads_communities: settings.studentLeadsCommunities,
    auto_flag_connections: settings.autoFlagConnections,
    require_idea_review: settings.requireIdeaReview,
    deadline_reminders: settings.deadlineReminders,
    weekly_digest: settings.weeklyDigest,
    recruitment_alerts: settings.recruitmentAlerts,
  });
}

export async function loadPublicStats(): Promise<PublicStats | null> {
  if (!isSupabaseConfigured) return null;
  const [students, ideas, projects] = await Promise.all([
    supabase.from("students").select("*", { count: "exact", head: true }),
    supabase.from("ideas").select("*", { count: "exact", head: true }),
    supabase.from("projects").select("*", { count: "exact", head: true }),
  ]);
  return {
    students: students.count ?? 0,
    ideas: ideas.count ?? 0,
    projects: projects.count ?? 0,
  };
}

export async function bumpConversationUnread(conversationId: string, forStudentId: string) {
  if (!isSupabaseConfigured) return;
  const { data } = await supabase
    .from("conversation_reads")
    .select("unread_count")
    .eq("conversation_id", conversationId)
    .eq("student_id", forStudentId)
    .maybeSingle();
  const unread = (data?.unread_count ?? 0) + 1;
  await supabase
    .from("conversation_reads")
    .upsert({ conversation_id: conversationId, student_id: forStudentId, unread_count: unread });
}

const slugId = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || `item-${Date.now()}`;

export async function insertApplication(app: Application) {
  if (!isSupabaseConfigured) return;
  await supabase.from("applications").insert({
    id: app.id,
    student_id: app.studentId,
    recruitment_id: app.recruitmentId,
    submitted: app.submitted,
    note: app.note,
    stage: app.stage,
  });
  const { count } = await supabase
    .from("applications")
    .select("*", { count: "exact", head: true })
    .eq("recruitment_id", app.recruitmentId);
  await supabase.from("recruitments").update({ applications: count ?? 0 }).eq("id", app.recruitmentId);
}

export async function insertRecruitment(recruitment: Recruitment) {
  if (!isSupabaseConfigured) return;
  await supabase.from("recruitments").insert({
    id: recruitment.id,
    title: recruitment.title,
    status: recruitment.status,
    skills: recruitment.skills,
    applications: recruitment.applications,
    closes: recruitment.closes,
    description: recruitment.description,
  });
}

export async function insertCommunity(community: Community) {
  if (!isSupabaseConfigured) return;
  await supabase.from("communities").insert({
    id: community.id,
    name: community.name,
    members: community.members,
    description: community.description,
    activity: community.activity,
    accent: community.accent,
  });
}

export async function deleteCommunity(id: string) {
  if (!isSupabaseConfigured) return;
  await supabase.from("communities").delete().eq("id", id);
}

export async function insertOpportunity(opportunity: Opportunity) {
  if (!isSupabaseConfigured) return;
  await supabase.from("opportunities").insert(opportunity);
}

export async function deleteOpportunity(id: string) {
  if (!isSupabaseConfigured) return;
  await supabase.from("opportunities").delete().eq("id", id);
}

export async function insertEvent(event: PlatformEvent & { seatsTotal?: number | null; seatsFilled?: number }) {
  if (!isSupabaseConfigured) return;
  await supabase.from("events").insert({
    id: event.id,
    title: event.title,
    event_date: event.date,
    place: event.place,
    seats_total: event.seatsTotal ?? null,
    seats_filled: event.seatsFilled ?? 0,
  });
}

export async function deleteEvent(id: string) {
  if (!isSupabaseConfigured) return;
  await supabase.from("events").delete().eq("id", id);
}

export async function insertReport(report: Report) {
  if (!isSupabaseConfigured) return;
  await supabase.from("reports").insert({
    id: report.id,
    target: report.target,
    kind: report.kind,
    reason: report.reason,
    date: report.date,
    status: report.status,
    ...(report.targetId ? { target_id: report.targetId } : {}),
  });
}

export async function registerOpportunity(userId: string, opportunityId: string) {
  if (!isSupabaseConfigured) return;
  await supabase.from("opportunity_registrations").insert({
    student_id: userId,
    opportunity_id: opportunityId,
  });
}

export async function syncIdeaReviewStatus(ideaId: string, status: "published" | "pending") {
  if (!isSupabaseConfigured) return;
  await supabase.from("ideas").update({ review_status: status }).eq("id", ideaId);
}

export async function publishIdeaLive(ideaId: string, creatorId: string) {
  if (!isSupabaseConfigured) return;
  await supabase.from("ideas").update({ review_status: "published", supports: 1, collaborators: 1 }).eq("id", ideaId);
  await supabase.from("idea_supporters").upsert(
    { student_id: creatorId, idea_id: ideaId },
    { onConflict: "student_id,idea_id", ignoreDuplicates: true },
  );
}

export async function insertCommunityJoinApplication(app: CommunityJoinApplication) {
  if (!isSupabaseConfigured) return;
  await supabase.from("community_join_applications").insert({
    id: app.id,
    student_id: app.studentId,
    community_id: app.communityId,
    submitted: app.submitted,
    note: app.note,
    status: app.status,
  });
}

export async function syncCommunityJoinApplicationStatus(
  id: string,
  status: CommunityJoinApplication["status"],
) {
  if (!isSupabaseConfigured) return;
  await supabase.from("community_join_applications").update({ status }).eq("id", id);
}

export async function insertCommunityPost(post: CommunityPost, activityLine: string) {
  if (!isSupabaseConfigured) return;
  await supabase.from("community_posts").insert({
    id: post.id,
    community_id: post.communityId,
    author_id: post.authorId,
    text: post.text,
  });
  const { data } = await supabase
    .from("communities")
    .select("activity")
    .eq("id", post.communityId)
    .maybeSingle();
  const activity = [activityLine, ...((data?.activity as string[] | null) ?? [])].slice(0, 6);
  await supabase.from("communities").update({ activity }).eq("id", post.communityId);
}

export async function updateStudentStatus(studentId: string, status: Student["status"]) {
  if (!isSupabaseConfigured) return;
  await supabase.from("students").update({ status }).eq("id", studentId);
}

export async function uploadProjectFile(
  projectId: string,
  file: File,
  byName: string,
): Promise<{ name: string; size: string; by: string; date: string; url?: string } | null> {
  if (!isSupabaseConfigured) return null;
  const path = `${projectId}/${Date.now()}-${file.name}`;
  const { error } = await supabase.storage.from("project-files").upload(path, file, { upsert: false });
  if (error) {
    console.warn("[AAVISHKAR] Storage upload failed — saving metadata only", error.message);
    return {
      name: file.name,
      size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
      by: byName,
      date: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    };
  }
  const { data } = supabase.storage.from("project-files").getPublicUrl(path);
  return {
    name: file.name,
    size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
    by: byName,
    date: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    url: data.publicUrl,
  };
}

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export async function uploadAvatar(ownerKey: string, file: File): Promise<string | null> {
  if (file.size > 512_000) return null;

  if (isSupabaseConfigured) {
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${ownerKey}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, {
      upsert: true,
      contentType: file.type,
    });
    if (!error) {
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      return data.publicUrl;
    }
    console.warn("[AAVISHKAR] Avatar storage upload failed — using inline data URL", error.message);
  }

  try {
    return await readFileAsDataUrl(file);
  } catch {
    return null;
  }
}

export function buildRecruitmentFromDraft(draft: NewRecruitment, existingIds: string[]): Recruitment {
  const id = slugId(draft.title);
  const uniqueId = existingIds.includes(id) ? `${id}-${Date.now()}` : id;
  return {
    id: uniqueId,
    title: draft.title,
    status: "Applications Open",
    skills: draft.skills
      .split(/[,·]/)
      .map((s) => s.trim())
      .filter(Boolean),
    applications: 0,
    closes: draft.closes,
    description: draft.description,
  };
}

export function buildOpportunityFromDraft(draft: NewOpportunity, existingIds: string[]): Opportunity {
  const id = slugId(draft.title);
  const uniqueId = existingIds.includes(id) ? `${id}-${Date.now()}` : id;
  return {
    id: uniqueId,
    title: draft.title,
    type: draft.type,
    deadline: draft.deadline,
    description: draft.description,
    eligibility: draft.eligibility,
    skills: draft.skills
      .split(/[,·]/)
      .map((s) => s.trim())
      .filter(Boolean),
    organizer: draft.organizer,
  };
}

export function buildEventFromDraft(draft: NewEvent, existingIds: string[]): PlatformEvent & {
  seatsTotal: number | null;
  seatsFilled: number;
} {
  const id = slugId(draft.title);
  const uniqueId = existingIds.includes(id) ? `${id}-${Date.now()}` : id;
  const total = draft.seatsTotal.trim() ? Number(draft.seatsTotal) : null;
  return {
    id: uniqueId,
    title: draft.title,
    date: draft.date,
    place: draft.place,
    seats: total ? `0 / ${total}` : "—",
    seatsTotal: total,
    seatsFilled: 0,
  };
}
