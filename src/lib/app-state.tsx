import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { INSTITUTION_NAME, PLATFORM_NAME } from "./brand";
import { toast } from "sonner";
import {
  buildAdminStats,
  buildCategorySplit,
  buildEngagementSeries,
  buildSkillDistribution,
  mergeActivity,
  type ActivityItem,
  type AdminStat,
  type CategoryCount,
  type EngagementPoint,
  type SkillCount,
} from "./admin-metrics";
import { getCurrentUser, setLiveStudents } from "./current-user";
import {
  adminEvents,
  adminActivity,
  communities as seedCommunities,
  opportunities as seedOpportunities,
  seedCommunityPosts,
  seedCommunityJoinApplications,
  seedApplications,
  seedConversations,
  seedIdeas,
  seedNotifications,
  seedProjects,
  seedRecruitments,
  seedReports,
  seedCommunityMembers,
  students as seedStudents,
  type Application,
  type Community,
  type Conversation,
  type Idea,
  type Notification,
  type Opportunity,
  type Project,
  type Recruitment,
  type Report,
  type Student,
  type CommunityPost,
  type CommunityJoinApplication,
} from "./mock-data";
import { communitiesWithLiveMemberCounts, deriveClasses, deriveIdeaCategories, deriveInterests, deriveSkills } from "./catalog";
import { isSupabaseConfigured } from "./supabase/client";
import { subscribeAppChanges } from "./realtime";
import type { NewEvent, NewOpportunity, NewRecruitment, NewReport, NewCommunity } from "./types";
import {
  buildEventFromDraft,
  buildOpportunityFromDraft,
  buildRecruitmentFromDraft,
  bumpConversationUnread,
  defaultStudentSettings,
  deleteEvent,
  deleteCommunity,
  deleteNotification,
  deleteOpportunity,
  ensureSeeded,
  insertApplication,
  insertCommunity,
  insertEvent,
  insertIdea,
  insertIdeaComment,
  insertMessage,
  insertNotification,
  insertOpportunity,
  insertRecruitment,
  insertReport,
  loadAppData,
  logActivity,
  registerOpportunity,
  syncApplicationStage,
  syncCommunity,
  syncConnection,
  syncConversationRead,
  syncJoinIdea,
  syncIdeaReviewStatus,
  syncIdeaSupport,
  syncNotificationsRead,
  syncPlatformSettings,
  syncRecruitmentStatus,
  syncReportStatus,
  syncSavedOpportunity,
  syncShortlist,
  syncShortlistMany,
  syncStudentSettings,
  updateStudent,
  updateStudentAvatar,
  updateStudentStatus,
  uploadAvatar,
  uploadProjectFile,
  upsertProject,
  type PlatformEvent,
  type PlatformSettings,
  type StudentSettings,
} from "./supabase/store";
import { getSessionUserId, getSessionPortal, COORDINATOR_AUTHOR_ID } from "./session";
type NewIdea = {
  title: string;
  category: string;
  problem: string;
  solution: string;
  lookingFor: string;
};

type NewProject = { title: string; description: string; deadline: string };

type ProfileUpdate = {
  name: string;
  className: string;
  bio: string;
  skills: string[];
};

type AppState = {
  ready: boolean;
  students: Student[];
  currentUser: Student;
  communities: Community[];
  opportunities: Opportunity[];
  findStudent: (id: string) => Student | undefined;
  updateProfile: (patch: ProfileUpdate) => void;
  updateProfilePicture: (file: File) => Promise<void>;
  updateCoordinatorPicture: (file: File) => Promise<void>;
  connections: string[];
  toggleConnection: (id: string) => void;
  isConnected: (id: string) => boolean;

  joinedCommunities: string[];
  communityMembers: Record<string, string[]>;
  getCommunityMemberIds: (communityId: string) => string[];
  communityPosts: CommunityPost[];
  communityJoinApplications: CommunityJoinApplication[];
  postToCommunity: (communityId: string, text: string) => void;
  getCommunityJoinStatus: (communityId: string) => "member" | "pending" | "rejected" | "none";
  applyToCommunity: (communityId: string, note: string) => boolean;
  leaveCommunity: (id: string, name: string) => void;
  setCommunityJoinApplicationStatus: (id: string, status: "Accepted" | "Rejected") => void;
  addCommunity: (draft: NewCommunity) => void;
  removeCommunity: (id: string) => void;

  ideas: Idea[];
  supported: string[];
  toggleSupport: (id: string) => void;
  joinedIdeas: string[];
  joinIdea: (id: string, title: string) => void;
  addIdea: (idea: NewIdea) => void;
  addComment: (ideaId: string, text: string) => void;

  projects: Project[];
  addProject: (p: NewProject) => void;
  toggleTask: (projectId: string, taskId: string) => void;
  sendProjectChat: (projectId: string, text: string) => void;

  conversations: Conversation[];
  sendMessage: (conversationId: string, text: string) => void;
  markConversationRead: (conversationId: string) => void;

  notifications: Notification[];
  markAllRead: () => void;
  dismissNotification: (id: string) => void;
  unreadCount: number;

  savedOpportunities: string[];
  registeredOpportunities: string[];
  toggleOpportunity: (id: string, title: string) => void;
  registerForOpportunity: (id: string, title: string) => void;

  shortlist: string[];
  toggleShortlist: (id: string) => void;
  shortlistMany: (ids: string[]) => void;

  recruitments: Recruitment[];
  setRecruitmentStatus: (id: string, status: Recruitment["status"]) => void;
  addRecruitment: (draft: NewRecruitment) => void;

  applications: Application[];
  setApplicationStage: (id: string, stage: Application["stage"]) => void;
  applyToRecruitment: (recruitmentId: string, note: string) => boolean;
  hasApplied: (recruitmentId: string) => boolean;

  reports: Report[];
  setReportStatus: (id: string, status: Report["status"]) => void;
  submitReport: (draft: NewReport) => void;

  events: PlatformEvent[];
  addEvent: (draft: NewEvent) => void;
  removeEvent: (id: string) => void;
  addOpportunity: (draft: NewOpportunity) => void;
  removeOpportunity: (id: string) => void;
  pendingIdeas: Idea[];
  publishIdea: (id: string) => void;
  restrictStudent: (id: string) => void;
  addProjectFile: (projectId: string, file: File) => void;
  filterOptions: { skills: string[]; interests: string[]; classes: string[]; categories: string[] };
  refreshData: () => Promise<void>;
  publishedIdeas: Idea[];
  allIdeas: Idea[];
  activity: ActivityItem[];
  adminStats: AdminStat[];
  engagementSeries: EngagementPoint[];
  skillDistribution: SkillCount[];
  categorySplit: CategoryCount[];
  directoryStudents: Student[];
  studentSettings: StudentSettings;
  updateStudentSettings: (patch: Partial<StudentSettings>, opts?: { silent?: boolean }) => void;
  platformSettings: PlatformSettings;
  updatePlatformSettings: (patch: Partial<PlatformSettings>, opts?: { silent?: boolean }) => void;
};

const AppStateContext = createContext<AppState | null>(null);

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || `item-${Date.now()}`;

const uniqueSlug = (s: string, existingIds: string[]) => {
  const base = slug(s);
  if (!existingIds.includes(base)) return base;
  let n = 2;
  while (existingIds.includes(`${base}-${n}`)) n++;
  return `${base}-${n}`;
};

export function AppStateProvider({ children }: { children: ReactNode }) {
  const userId = getSessionUserId();
  const currentUser = getCurrentUser();

  const [ready, setReady] = useState(!isSupabaseConfigured);
  const [students, setStudents] = useState<Student[]>(seedStudents);
  const [communities, setCommunities] = useState<Community[]>(() =>
    communitiesWithLiveMemberCounts(seedCommunities, seedCommunityMembers),
  );
  const [opportunities, setOpportunities] = useState<Opportunity[]>(seedOpportunities);
  const [connections, setConnections] = useState<string[]>(["shaurya", "tanvi", "rehan", "ananya"]);
  const [joinedCommunities, setJoinedCommunities] = useState<string[]>(["ai-ml", "robotics", "coding"]);
  const [communityMembers, setCommunityMembers] = useState<Record<string, string[]>>(seedCommunityMembers);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(seedCommunityPosts);
  const [communityJoinApplications, setCommunityJoinApplications] = useState<CommunityJoinApplication[]>(
    seedCommunityJoinApplications,
  );
  const [ideas, setIdeas] = useState<Idea[]>(seedIdeas);
  const [supported, setSupported] = useState<string[]>(["campus-air-map"]);
  const [joinedIdeas, setJoinedIdeas] = useState<string[]>([]);
  const [projects, setProjects] = useState<Project[]>(seedProjects);
  const [conversations, setConversations] = useState<Conversation[]>(seedConversations);
  const [notifications, setNotifications] = useState<Notification[]>(seedNotifications);
  const [savedOpportunities, setSavedOpportunities] = useState<string[]>([]);
  const [registeredOpportunities, setRegisteredOpportunities] = useState<string[]>([]);
  const [shortlist, setShortlist] = useState<string[]>([]);
  const [recruitments, setRecruitments] = useState<Recruitment[]>(seedRecruitments);
  const [applications, setApplications] = useState<Application[]>(seedApplications);
  const [reports, setReports] = useState<Report[]>(seedReports);
  const [events, setEvents] = useState<PlatformEvent[]>(
    adminEvents.map((e, i) => ({ id: `event-${i}`, ...e, seats: e.seats })),
  );
  const [activity, setActivity] = useState<ActivityItem[]>(adminActivity);
  const [projectCreatedAt, setProjectCreatedAt] = useState<Map<string, string>>(new Map());
  const [studentSettings, setStudentSettings] = useState<StudentSettings>(defaultStudentSettings());
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>({
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
  const [discoverHiddenIds, setDiscoverHiddenIds] = useState<string[]>([]);

  const applySnapshot = (data: NonNullable<Awaited<ReturnType<typeof loadAppData>>>) => {
    setStudents(data.students);
    setLiveStudents(data.students);
    setCommunities(communitiesWithLiveMemberCounts(data.communities, data.communityMembers));
    setOpportunities(data.opportunities);
    setConnections(data.connections);
    setJoinedCommunities(data.joinedCommunities);
    setCommunityMembers(data.communityMembers);
    setIdeas(data.ideas);
    setSupported(data.supported);
    setJoinedIdeas(data.joinedIdeas);
    setProjects(data.projects);
    setConversations(data.conversations);
    setNotifications(data.notifications);
    setSavedOpportunities(data.savedOpportunities);
    setRegisteredOpportunities(data.registeredOpportunities);
    setShortlist(data.shortlist);
    setRecruitments(data.recruitments);
    setApplications(data.applications);
    setReports(data.reports);
    setEvents(data.events);
    setActivity(data.activity);
    setProjectCreatedAt(data.projectCreatedAt);
    setStudentSettings(data.studentSettings);
    setPlatformSettings({
      ...data.platformSettings,
      platformName: PLATFORM_NAME,
      institution: INSTITUTION_NAME,
    });
    setDiscoverHiddenIds(data.discoverHiddenIds);
  };

  const refreshData = async () => {
    if (!isSupabaseConfigured) return;
    const data = await loadAppData(userId);
    if (data) applySnapshot(data);
  };

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let cancelled = false;
    (async () => {
      try {
        await ensureSeeded();
        const data = await loadAppData(userId);
        if (cancelled || !data) return;
        applySnapshot(data);
      } catch (err) {
        console.error("[AAVISHKAR] Failed to load Supabase data", err);
        toast.error("Could not load saved data. Using offline demo state.");
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (!isSupabaseConfigured || !ready) return;
    return subscribeAppChanges(userId, () => {
      void refreshData();
    });
  }, [userId, ready]);

  const value = useMemo<AppState>(() => {
    const nameOf = (id: string) => students.find((s) => s.id === id)?.name ?? "Student";
    const me = students.find((s) => s.id === userId) ?? currentUser;

    const pushActivity = (text: string) => {
      setActivity((prev) => [{ text, time: "just now" }, ...prev].slice(0, 12));
      void logActivity(text);
    };

    const notifyStudent = (targetId: string, kind: Notification["kind"], text: string) => {
      if (targetId === userId) return;
      void insertNotification(targetId, kind, text);
    };

    const adminStats = buildAdminStats({
      students,
      projects,
      recruitments,
      applications,
      communities,
      opportunities,
    });
    const skillDistribution = buildSkillDistribution(students);
    const categorySplit = buildCategorySplit(ideas);
    const engagementSeries = buildEngagementSeries(students, projects, projectCreatedAt);
    const mergedActivity = mergeActivity(activity, ideas, applications, students);
    const directoryStudents = students.filter(
      (s) => s.id === userId || !discoverHiddenIds.includes(s.id),
    );
    const pendingIdeas = ideas.filter((i) => i.reviewStatus === "pending");
    const publishedIdeas = ideas.filter(
      (i) => i.reviewStatus !== "pending" || i.creatorId === userId,
    );
    const filterOptions = {
      skills: deriveSkills(students),
      interests: deriveInterests(students),
      classes: deriveClasses(students),
      categories: deriveIdeaCategories(ideas),
    };
    const hasApplied = (recruitmentId: string) =>
      applications.some((a) => a.recruitmentId === recruitmentId && a.studentId === userId);

    return {
      ready,
      students,
      currentUser: me,
      communities,
      opportunities,
      findStudent: (id: string) => students.find((s) => s.id === id),
      updateProfile: (patch) => {
        const updated: Student = { ...me, ...patch };
        setStudents((prev) => {
          const next = prev.map((s) => (s.id === userId ? updated : s));
          setLiveStudents(next);
          return next;
        });
        void updateStudent(updated);
        toast.success("Profile saved");
      },
      updateProfilePicture: async (file) => {
        const url = await uploadAvatar(userId, file);
        if (!url) {
          toast.error("Could not upload photo. Use a JPG or PNG under 500 KB.");
          return;
        }
        const updated: Student = { ...me, avatarUrl: url };
        setStudents((prev) => {
          const next = prev.map((s) => (s.id === userId ? updated : s));
          setLiveStudents(next);
          return next;
        });
        void updateStudentAvatar(userId, url);
        toast.success("Profile picture updated");
      },
      updateCoordinatorPicture: async (file) => {
        const url = await uploadAvatar("coordinator", file);
        if (!url) {
          toast.error("Could not upload photo. Use a JPG or PNG under 500 KB.");
          return;
        }
        setPlatformSettings((prev) => {
          const next = { ...prev, coordinatorAvatarUrl: url };
          void syncPlatformSettings(next);
          return next;
        });
        toast.success("Profile picture updated");
      },
      connections,
      isConnected: (id) => connections.includes(id),
      toggleConnection: (id) => {
        setConnections((prev) => {
          const has = prev.includes(id);
          toast[has ? "message" : "success"](
            has ? `Removed connection with ${nameOf(id)}` : `Connection request sent to ${nameOf(id)}`,
          );
          void syncConnection(userId, id, !has);
          if (!has) {
            notifyStudent(id, "connection", `${me.name} sent you a connection request`);
            pushActivity(`${me.name} connected with ${nameOf(id)}`);
          }
          return has ? prev.filter((c) => c !== id) : [...prev, id];
        });
      },

      joinedCommunities,
      communityMembers,
      getCommunityMemberIds: (communityId) => communityMembers[communityId] ?? [],
      communityPosts,
      communityJoinApplications,
      getCommunityJoinStatus: (communityId) => {
        if (joinedCommunities.includes(communityId)) return "member";
        const app = communityJoinApplications
          .filter((a) => a.studentId === userId && a.communityId === communityId)
          .sort((a, b) => b.id.localeCompare(a.id))[0];
        if (!app) return "none";
        if (app.status === "Pending") return "pending";
        if (app.status === "Rejected") return "rejected";
        return "none";
      },
      applyToCommunity: (communityId, note) => {
        const community = communities.find((c) => c.id === communityId);
        if (!community) return false;
        if (joinedCommunities.includes(communityId)) {
          toast.message("You're already in this community.");
          return false;
        }
        if (
          communityJoinApplications.some(
            (a) => a.studentId === userId && a.communityId === communityId && a.status === "Pending",
          )
        ) {
          toast.message("Your application is pending coordinator review.");
          return false;
        }
        const app: CommunityJoinApplication = {
          id: `cja-${Date.now()}`,
          studentId: userId,
          communityId,
          submitted: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" }),
          note: note.trim(),
          status: "Pending",
        };
        setCommunityJoinApplications((prev) => [...prev, app]);
        pushActivity(`${me.name} applied to join “${community.name}”`);
        toast.success("Application submitted", {
          description: "A coordinator will review your request.",
        });
        return true;
      },
      leaveCommunity: (id, name) => {
        if (!joinedCommunities.includes(id)) return;
        setJoinedCommunities((prev) => prev.filter((c) => c !== id));
        void syncCommunity(userId, id, false);
        setCommunities((cs) =>
          cs.map((c) => (c.id === id ? { ...c, members: Math.max(0, c.members - 1) } : c)),
        );
        setCommunityMembers((members) => ({
          ...members,
          [id]: (members[id] ?? []).filter((sid) => sid !== userId),
        }));
        toast.message(`Left ${name}`);
      },
      setCommunityJoinApplicationStatus: (id, status) => {
        if (getSessionPortal() !== "admin") {
          toast.error("Only coordinators can review community applications.");
          return;
        }
        const app = communityJoinApplications.find((a) => a.id === id);
        if (!app || app.status !== "Pending") return;

        setCommunityJoinApplications((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status } : a)),
        );

        const student = students.find((s) => s.id === app.studentId);
        const community = communities.find((c) => c.id === app.communityId);
        const communityName = community?.name ?? "community";

        if (status === "Accepted") {
          setCommunityMembers((members) => {
            const list = members[app.communityId] ?? [];
            if (list.includes(app.studentId)) return members;
            return { ...members, [app.communityId]: [...list, app.studentId] };
          });
          setCommunities((cs) =>
            cs.map((c) =>
              c.id === app.communityId ? { ...c, members: c.members + 1 } : c,
            ),
          );
          void syncCommunity(app.studentId, app.communityId, true);
          if (app.studentId === userId) {
            setJoinedCommunities((prev) =>
              prev.includes(app.communityId) ? prev : [...prev, app.communityId],
            );
          }
          notifyStudent(
            app.studentId,
            "community",
            `You were accepted into “${communityName}”`,
          );
          pushActivity(`${student?.name ?? "Student"} joined “${communityName}”`);
          toast.success(`Accepted ${student?.name ?? "student"} into ${communityName}`);
        } else {
          notifyStudent(
            app.studentId,
            "community",
            `Your application to “${communityName}” was not accepted this time.`,
          );
          toast.message(`Application rejected for ${student?.name ?? "student"}`);
        }
      },
      postToCommunity: (communityId, text) => {
        if (getSessionPortal() !== "admin") {
          toast.error("Only ATL coordinators can post to community feeds.");
          return;
        }
        const communityName = communities.find((c) => c.id === communityId)?.name ?? "a community";
        const coordinatorName = platformSettings.coordinatorName;
        const post: CommunityPost = {
          id: `cp-${Date.now()}`,
          communityId,
          authorId: COORDINATOR_AUTHOR_ID,
          text: text.trim(),
          time: "just now",
        };
        setCommunityPosts((prev) => [post, ...prev]);
        setCommunities((prev) =>
          prev.map((c) =>
            c.id === communityId ? { ...c, activity: [text.trim(), ...c.activity].slice(0, 6) } : c,
          ),
        );
        pushActivity(`${coordinatorName} posted in ${communityName}`);
        toast.success("Posted to community feed");
      },
      addCommunity: (draft) => {
        if (getSessionPortal() !== "admin") {
          toast.error("Only ATL coordinators can create communities.");
          return;
        }
        const id = uniqueSlug(
          draft.name,
          communities.map((c) => c.id),
        );
        const community: Community = {
          id,
          name: draft.name.trim(),
          description: draft.description.trim(),
          members: 0,
          activity: [`Community created by ${platformSettings.coordinatorName}`],
          accent: "from-primary to-accent",
          sessions: draft.sessionTitle.trim()
            ? [{ title: draft.sessionTitle.trim(), when: draft.sessionWhen.trim() || "TBA", place: draft.sessionPlace.trim() || "TBA" }]
            : [],
          resources: [],
        };
        setCommunities((prev) => [community, ...prev]);
        setCommunityMembers((prev) => ({ ...prev, [id]: [] }));
        void insertCommunity(community);
        pushActivity(`New community created: “${community.name}”`);
        toast.success("Community created");
      },
      removeCommunity: (id) => {
        if (getSessionPortal() !== "admin") {
          toast.error("Only ATL coordinators can remove communities.");
          return;
        }
        const name = communities.find((c) => c.id === id)?.name ?? "Community";
        setCommunities((prev) => prev.filter((c) => c.id !== id));
        setCommunityMembers((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        setCommunityPosts((prev) => prev.filter((p) => p.communityId !== id));
        setJoinedCommunities((prev) => prev.filter((cid) => cid !== id));
        void deleteCommunity(id);
        toast.message(`${name} removed`);
      },

      ideas: publishedIdeas,
      allIdeas: ideas,
      publishedIdeas,
      pendingIdeas,
      supported,
      toggleSupport: (id) => {
        setSupported((prev) => {
          const wasSupported = prev.includes(id);
          setIdeas((ideas) => {
            const next = ideas.map((i) =>
              i.id === id ? { ...i, supports: i.supports + (wasSupported ? -1 : 1) } : i,
            );
            const updated = next.find((i) => i.id === id);
            if (updated) void syncIdeaSupport(userId, id, !wasSupported, updated.supports);
            return next;
          });
          return wasSupported ? prev.filter((s) => s !== id) : [...prev, id];
        });
      },
      joinedIdeas,
      joinIdea: (id, title) => {
        setJoinedIdeas((prev) => {
          if (prev.includes(id)) return prev;
          const idea = ideas.find((i) => i.id === id);
          setIdeas((ideas) => {
            const next = ideas.map((i) =>
              i.id === id
                ? {
                    ...i,
                    collaborators: i.collaborators + 1,
                    interested: i.interested.includes(me.id) ? i.interested : [...i.interested, me.id],
                  }
                : i,
            );
            const updated = next.find((i) => i.id === id);
            if (updated) void syncJoinIdea(userId, updated);
            return next;
          });
          if (idea && idea.creatorId !== userId) {
            notifyStudent(idea.creatorId, "idea", `${me.name} joined your idea “${title}”`);
          }
          pushActivity(`${me.name} joined idea “${title}”`);
          toast.success(`You joined “${title}”`, { description: "The creator has been notified." });
          return [...prev, id];
        });
      },
      addIdea: (draft) => {
        const needsReview = platformSettings.requireIdeaReview;
        setIdeas((prev) => {
          const id = uniqueSlug(
            draft.title,
            prev.map((i) => i.id),
          );
          const reviewStatus = needsReview ? "pending" : "published";
          const idea: Idea = {
            id,
            title: draft.title,
            category: draft.category,
            problem: draft.problem,
            solution: draft.solution,
            why: "Shared on AAVISHKAR — looking for collaborators across APSDK.",
            lookingFor: draft.lookingFor
              .split(/[,·]/)
              .map((s) => s.trim())
              .filter(Boolean),
            technologies: [],
            creatorId: me.id,
            supports: needsReview ? 0 : 1,
            collaborators: needsReview ? 0 : 1,
            interested: [],
            comments: [],
            reviewStatus,
          };
          if (!needsReview) setSupported((sup) => [...sup, id]);
          void insertIdea(idea, reviewStatus);
          pushActivity(
            needsReview
              ? `${me.name} submitted idea “${draft.title}” for review`
              : `${me.name} shared a new idea: “${draft.title}”`,
          );
          toast.success(
            needsReview ? "Idea submitted for coordinator review" : "Idea shared with the school",
            { description: draft.title },
          );
          return [idea, ...prev];
        });
      },
      addComment: (ideaId, text) => {
        const idea = ideas.find((i) => i.id === ideaId);
        const comment = {
          id: `c-${Date.now()}`,
          authorId: me.id,
          text,
          time: "just now",
        };
        setIdeas((prev) =>
          prev.map((i) => (i.id === ideaId ? { ...i, comments: [...i.comments, comment] } : i)),
        );
        void insertIdeaComment(ideaId, comment);
        if (idea && idea.creatorId !== userId) {
          notifyStudent(idea.creatorId, "idea", `${me.name} commented on “${idea.title}”`);
        }
      },

      projects,
      addProject: (draft) => {
        if (!platformSettings.allowStudentProjects) {
          toast.error("Project creation is disabled by your ATL coordinator.");
          return;
        }
        setProjects((prev) => {
          const id = uniqueSlug(
            draft.title,
            prev.map((p) => p.id),
          );
          const project: Project = {
            id,
            title: draft.title,
            description: draft.description,
            status: "Planning",
            progress: 0,
            memberIds: [me.id],
            deadline: draft.deadline || "Not set",
            milestones: [],
            tasks: [
              { id: "t1", title: "Define the problem", done: false },
              { id: "t2", title: "Sketch the solution", done: false },
            ],
            files: [],
            updates: [],
            chat: [],
            mine: true,
          };
          void upsertProject(project);
          pushActivity(`${me.name} started project “${draft.title}”`);
          toast.success("Project created", { description: draft.title });
          return [project, ...prev];
        });
      },
      toggleTask: (projectId, taskId) => {
        setProjects((prev) => {
          const next = prev.map((p) => {
            if (p.id !== projectId) return p;
            const tasks = p.tasks.map((t) =>
              t.id === taskId ? { ...t, done: !t.done, inProgress: false } : t,
            );
            const progress = tasks.length
              ? Math.round((tasks.filter((t) => t.done).length / tasks.length) * 100)
              : 0;
            return { ...p, tasks, progress };
          });
          const updated = next.find((p) => p.id === projectId);
          if (updated) void upsertProject(updated);
          return next;
        });
      },
      sendProjectChat: (projectId, text) => {
        setProjects((prev) => {
          const next = prev.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  chat: [
                    ...p.chat,
                    {
                      authorId: me.id,
                      text,
                      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                    },
                  ],
                }
              : p,
          );
          const updated = next.find((p) => p.id === projectId);
          if (updated) void upsertProject(updated);
          return next;
        });
      },

      conversations,
      sendMessage: (conversationId, text) => {
        const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: [...c.messages, { fromMe: true, text, time }],
                }
              : c,
          ),
        );
        void insertMessage(userId, conversationId, text, conversationId);
        void bumpConversationUnread(conversationId, conversationId);
        notifyStudent(conversationId, "message", `${me.name} sent you a message`);
      },
      markConversationRead: (conversationId) => {
        setConversations((prev) =>
          prev.map((c) => (c.id === conversationId ? { ...c, unread: 0 } : c)),
        );
        void syncConversationRead(conversationId, userId);
      },

      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
      markAllRead: () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        void syncNotificationsRead(userId);
        toast.message("All notifications marked as read");
      },
      dismissNotification: (id) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        void deleteNotification(id);
      },

      savedOpportunities,
      registeredOpportunities,
      toggleOpportunity: (id, title) => {
        setSavedOpportunities((prev) => {
          const has = prev.includes(id);
          toast[has ? "message" : "success"](has ? `Removed ${title}` : `Saved ${title}`);
          void syncSavedOpportunity(userId, id, !has);
          return has ? prev.filter((o) => o !== id) : [...prev, id];
        });
      },
      registerForOpportunity: (id, title) => {
        if (registeredOpportunities.includes(id)) {
          toast.message("You're already registered for this opportunity");
          return;
        }
        setRegisteredOpportunities((prev) => [...prev, id]);
        void registerOpportunity(userId, id);
        pushActivity(`${me.name} registered for “${title}”`);
        toast.success("Registration recorded", { description: title });
      },

      shortlist,
      toggleShortlist: (id) => {
        setShortlist((prev) => {
          const has = prev.includes(id);
          toast[has ? "message" : "success"](
            has ? `${nameOf(id)} removed from shortlist` : `${nameOf(id)} shortlisted`,
          );
          void syncShortlist(id, !has);
          return has ? prev.filter((s) => s !== id) : [...prev, id];
        });
      },
      shortlistMany: (ids) => {
        setShortlist((prev) => Array.from(new Set([...prev, ...ids])));
        void syncShortlistMany(ids);
        toast.success(`${ids.length} students added to the shortlist`);
      },

      recruitments,
      setRecruitmentStatus: (id, status) => {
        if (!platformSettings.coordinatorsCloseRecruitments && status === "Closed") {
          toast.error("Coordinators cannot close recruitments with current platform settings.");
          return;
        }
        setRecruitments((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
        void syncRecruitmentStatus(id, status);
        toast.success(`Recruitment status set to ${status}`);
      },
      addRecruitment: (draft) => {
        const recruitment = buildRecruitmentFromDraft(
          draft,
          recruitments.map((r) => r.id),
        );
        setRecruitments((prev) => [recruitment, ...prev]);
        void insertRecruitment(recruitment);
        pushActivity(`New recruitment opened: “${recruitment.title}”`);
        toast.success("Recruitment published");
      },

      applications,
      hasApplied,
      setApplicationStage: (id, stage) => {
        setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, stage } : a)));
        void syncApplicationStage(id, stage);
        toast.success(`Application marked ${stage}`);
      },
      applyToRecruitment: (recruitmentId, note) => {
        const recruitment = recruitments.find((r) => r.id === recruitmentId);
        if (!recruitment || recruitment.status === "Closed") {
          toast.error("This recruitment is not accepting applications.");
          return false;
        }
        if (hasApplied(recruitmentId)) {
          toast.message("You already applied to this recruitment.");
          return false;
        }
        const app: Application = {
          id: `app-${Date.now()}`,
          studentId: userId,
          recruitmentId,
          submitted: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" }),
          note,
          stage: "New",
        };
        setApplications((prev) => [...prev, app]);
        setRecruitments((prev) =>
          prev.map((r) =>
            r.id === recruitmentId ? { ...r, applications: r.applications + 1 } : r,
          ),
        );
        void insertApplication(app);
        pushActivity(`${me.name} applied to “${recruitment.title}”`);
        toast.success("Application submitted");
        return true;
      },

      reports,
      setReportStatus: (id, status) => {
        setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
        void syncReportStatus(id, status);
        toast.message(`Report ${status.toLowerCase()}`);
      },
      submitReport: (draft) => {
        const report: Report = {
          id: `r-${Date.now()}`,
          target: draft.target,
          kind: draft.kind,
          reason: draft.reason,
          date: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" }),
          status: "Open",
        };
        setReports((prev) => [report, ...prev]);
        void insertReport(report);
        toast.success("Report submitted to coordinators");
      },

      events,
      addEvent: (draft) => {
        const built = buildEventFromDraft(
          draft,
          events.map((e) => e.id),
        );
        setEvents((prev) => [{ id: built.id, title: built.title, date: built.date, place: built.place, seats: built.seats }, ...prev]);
        void insertEvent(built);
        toast.success("Event added");
      },
      removeEvent: (id) => {
        setEvents((prev) => prev.filter((e) => e.id !== id));
        void deleteEvent(id);
        toast.message("Event removed");
      },
      addOpportunity: (draft) => {
        const opp = buildOpportunityFromDraft(
          draft,
          opportunities.map((o) => o.id),
        );
        setOpportunities((prev) => [opp, ...prev]);
        void insertOpportunity(opp);
        toast.success("Opportunity published");
      },
      removeOpportunity: (id) => {
        setOpportunities((prev) => prev.filter((o) => o.id !== id));
        void deleteOpportunity(id);
        toast.message("Opportunity removed");
      },
      publishIdea: (id) => {
        setIdeas((prev) =>
          prev.map((i) =>
            i.id === id ? { ...i, reviewStatus: "published", supports: Math.max(1, i.supports) } : i,
          ),
        );
        void syncIdeaReviewStatus(id, "published");
        toast.success("Idea published to the school");
      },
      restrictStudent: (id) => {
        setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, status: "Inactive" } : s)));
        void updateStudentStatus(id, "Inactive");
        toast.message(`${nameOf(id)} marked inactive`);
      },
      addProjectFile: (projectId, file) => {
        void (async () => {
          const meta = await uploadProjectFile(projectId, file, me.name);
          if (!meta) return;
          setProjects((prev) => {
            const next = prev.map((p) =>
              p.id === projectId ? { ...p, files: [...p.files, meta] } : p,
            );
            const updated = next.find((p) => p.id === projectId);
            if (updated) void upsertProject(updated);
            return next;
          });
          toast.success("File added to project");
        })();
      },
      filterOptions,
      refreshData,
      activity: mergedActivity,
      adminStats,
      engagementSeries,
      skillDistribution,
      categorySplit,
      directoryStudents,
      studentSettings,
      updateStudentSettings: (patch, opts) => {
        setStudentSettings((prev) => {
          const next = { ...prev, ...patch };
          void syncStudentSettings(userId, next);
          if (patch.showInDiscover !== undefined) {
            setDiscoverHiddenIds((ids) =>
              patch.showInDiscover ? ids.filter((i) => i !== userId) : [...new Set([...ids, userId])],
            );
          }
          if (!opts?.silent) toast.success("Preferences saved");
          return next;
        });
      },
      platformSettings,
      updatePlatformSettings: (patch, opts) => {
        const { platformName: _pn, institution: _in, ...editable } = patch;
        setPlatformSettings((prev) => {
          const next = {
            ...prev,
            ...editable,
            platformName: PLATFORM_NAME,
            institution: INSTITUTION_NAME,
          };
          void syncPlatformSettings(next);
          if (!opts?.silent) toast.success("Platform settings saved");
          return next;
        });
      },
    };
  }, [
    ready,
    userId,
    currentUser,
    students,
    communities,
    opportunities,
    connections,
    joinedCommunities,
    communityMembers,
    communityPosts,
    communityJoinApplications,
    ideas,
    supported,
    joinedIdeas,
    projects,
    projectCreatedAt,
    conversations,
    notifications,
    savedOpportunities,
    registeredOpportunities,
    shortlist,
    recruitments,
    applications,
    reports,
    events,
    activity,
    studentSettings,
    platformSettings,
    discoverHiddenIds,
  ]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Loading AAVISHKAR…
      </div>
    );
  }

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used inside AppStateProvider");
  return ctx;
}
