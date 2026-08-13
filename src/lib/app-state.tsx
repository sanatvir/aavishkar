import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
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
import { PlatformLoadError } from "@/components/PlatformLoadError";
import { SupabaseConfigRequired } from "@/components/SupabaseConfigRequired";
import {
  createDemoRuntimeBootstrap,
  createRuntimeBootstrap,
  requiresSupabaseConfig,
  type RuntimeBootstrap,
  useOfflineDemo,
} from "./runtime-data";
import { isSupabaseConfigured } from "./supabase/client";
import { subscribeAppChanges } from "./realtime";
import type { NewEvent, NewOpportunity, NewRecruitment, NewReport, NewCommunity } from "./types";
import {
  buildEventFromDraft,
  buildOpportunityFromDraft,
  buildRecruitmentFromDraft,
  bumpConversationUnread,
  deleteEvent,
  deleteCommunity,
  deleteNotification,
  deleteOpportunity,
  ensureConversation,
  ensureSeeded,
  insertApplication,
  insertCommunity,
  insertCommunityJoinApplication,
  insertCommunityPost,
  insertEvent,
  insertIdea,
  insertIdeaComment,
  insertMessage,
  insertNotification,
  insertOpportunity,
  insertRecruitment,
  insertReport,
  insertStudent,
  loadAppData,
  logActivity,
  publishIdeaLive,
  registerOpportunity,
  rejectIdea as deleteIdeaLive,
  syncApplicationStage,
  syncCommunity,
  syncCommunityJoinApplicationStatus,
  syncConnection,
  syncConversationRead,
  syncJoinIdea,
  syncIdeaSupport,
  syncNotificationsRead,
  syncPlatformSettings,
  syncRecruitmentStatus,
  syncReportStatus,
  syncSavedOpportunity,
  syncShortlist,
  syncShortlistMany,
  syncStudentSettings,
  syncStudentRecord,
  updateCommunityRecord,
  updateEvent,
  updateOpportunity,
  updateStudent,
  updateStudentAvatar,
  updateStudentStatus,
  uploadAvatar,
  uploadProjectFile,
  upsertProject,
  type PlatformEvent,
  type PlatformSettings,
  type StudentPrivacy,
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

type NewStudent = {
  name: string;
  className: string;
  bio: string;
  skills: string;
  interests: string;
  availability: Student["availability"];
};

function joinApplicationSortKey(app: CommunityJoinApplication): number {
  const fromId = /^cja-(\d+)$/.exec(app.id);
  if (fromId) return Number(fromId[1]);
  const parsed = Date.parse(app.submitted);
  return Number.isFinite(parsed) ? parsed : 0;
}

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
  saveCommunity: (community: Community) => void;

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
  postProjectUpdate: (projectId: string, text: string) => void;
  inviteToProject: (projectId: string, studentId: string) => void;

  conversations: Conversation[];
  sendMessage: (conversationId: string, text: string) => void;
  startConversation: (withId: string) => string | null;
  canMessageStudent: (id: string) => boolean;
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
  saveEvent: (event: PlatformEvent) => void;
  removeEvent: (id: string) => void;
  addOpportunity: (draft: NewOpportunity) => void;
  saveOpportunity: (opportunity: Opportunity) => void;
  removeOpportunity: (id: string) => void;
  pendingIdeas: Idea[];
  publishIdea: (id: string) => void;
  rejectIdea: (id: string) => void;
  restrictStudent: (id: string) => void;
  reactivateStudent: (id: string) => void;
  addStudent: (draft: NewStudent) => void;
  saveStudentRecord: (student: Student) => void;
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
  publicStudent: (student: Student) => Student;
  studentSettings: StudentSettings;
  updateStudentSettings: (patch: Partial<StudentSettings>, opts?: { silent?: boolean }) => void;
  exportUserData: () => void;
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
  const initialRuntime = createRuntimeBootstrap();

  const [ready, setReady] = useState(useOfflineDemo);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [students, setStudents] = useState<Student[]>(initialRuntime.students);
  const [communities, setCommunities] = useState<Community[]>(initialRuntime.communities);
  const [opportunities, setOpportunities] = useState<Opportunity[]>(initialRuntime.opportunities);
  const [connections, setConnections] = useState<string[]>(initialRuntime.connections);
  const [joinedCommunities, setJoinedCommunities] = useState<string[]>(initialRuntime.joinedCommunities);
  const [communityMembers, setCommunityMembers] = useState<Record<string, string[]>>(initialRuntime.communityMembers);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(initialRuntime.communityPosts);
  const [communityJoinApplications, setCommunityJoinApplications] = useState<CommunityJoinApplication[]>(
    initialRuntime.communityJoinApplications,
  );
  const [ideas, setIdeas] = useState<Idea[]>(initialRuntime.ideas);
  const [supported, setSupported] = useState<string[]>(initialRuntime.supported);
  const [joinedIdeas, setJoinedIdeas] = useState<string[]>(initialRuntime.joinedIdeas);
  const [projects, setProjects] = useState<Project[]>(initialRuntime.projects);
  const [conversations, setConversations] = useState<Conversation[]>(initialRuntime.conversations);
  const [notifications, setNotifications] = useState<Notification[]>(initialRuntime.notifications);
  const [savedOpportunities, setSavedOpportunities] = useState<string[]>(initialRuntime.savedOpportunities);
  const [registeredOpportunities, setRegisteredOpportunities] = useState<string[]>(
    initialRuntime.registeredOpportunities,
  );
  const [shortlist, setShortlist] = useState<string[]>(initialRuntime.shortlist);
  const [recruitments, setRecruitments] = useState<Recruitment[]>(initialRuntime.recruitments);
  const [applications, setApplications] = useState<Application[]>(initialRuntime.applications);
  const [reports, setReports] = useState<Report[]>(initialRuntime.reports);
  const [events, setEvents] = useState<PlatformEvent[]>(initialRuntime.events);
  const [activity, setActivity] = useState<ActivityItem[]>(initialRuntime.activity);
  const [projectCreatedAt, setProjectCreatedAt] = useState<Map<string, string>>(initialRuntime.projectCreatedAt);
  const [studentSettings, setStudentSettings] = useState<StudentSettings>(initialRuntime.studentSettings);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(initialRuntime.platformSettings);
  const [discoverHiddenIds, setDiscoverHiddenIds] = useState<string[]>(initialRuntime.discoverHiddenIds);
  const [studentPrivacyMap, setStudentPrivacyMap] = useState<Record<string, StudentPrivacy>>(
    initialRuntime.studentPrivacyMap,
  );
  const loadGeneration = useRef(0);

  const applyRuntimeState = (data: RuntimeBootstrap | NonNullable<Awaited<ReturnType<typeof loadAppData>>>) => {
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
    setStudentPrivacyMap(data.studentPrivacyMap ?? {});
    setCommunityJoinApplications(data.communityJoinApplications);
    setCommunityPosts(data.communityPosts);
  };

  const refreshData = async () => {
    if (!isSupabaseConfigured) return;
    const generation = ++loadGeneration.current;
    const data = await loadAppData(userId);
    if (generation !== loadGeneration.current || !data) return;
    applyRuntimeState(data);
  };

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let cancelled = false;
    setReady(false);
    setLoadError(null);

    (async () => {
      try {
        await ensureSeeded();
        const data = await loadAppData(userId);
        if (cancelled || !data) return;
        applyRuntimeState(data);
      } catch (err) {
        console.error("[AAVISHKAR] Failed to load Supabase data", err);
        if (import.meta.env.PROD) {
          setLoadError("Check your Supabase project, SQL migrations, and network connection, then try again.");
        } else {
          applyRuntimeState(createDemoRuntimeBootstrap());
          toast.error("Supabase load failed — using local demo data for development.");
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, loadAttempt]);

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
      if (targetId === userId) {
        const notifyKey: Partial<Record<Notification["kind"], keyof StudentSettings>> = {
          connection: "notifyConnections",
          project: "notifyProjects",
          recruitment: "notifyProjects",
          opportunity: "notifyOpportunities",
          community: "notifyCommunities",
          idea: "notifyProjects",
        };
        const key = notifyKey[kind];
        if (key && !studentSettings[key]) return;
        setNotifications((prev) => [
          { id: `n-${Date.now()}`, kind, text, time: "just now", read: false },
          ...prev,
        ]);
        return;
      }
      void insertNotification(targetId, kind, text);
    };

    const privacyFor = (id: string): StudentPrivacy =>
      studentPrivacyMap[id] ?? { showClass: true, allowMessages: true, showProjectsPublic: false };

    const canMessageStudent = (id: string) => {
      if (id === userId) return true;
      return privacyFor(id).allowMessages;
    };

    const publicStudent = (student: Student): Student => {
      if (student.id === userId) return student;
      const privacy = privacyFor(student.id);
      return {
        ...student,
        className: privacy.showClass ? student.className : "Class hidden",
        projects: privacy.showProjectsPublic || connections.includes(student.id) ? student.projects : [],
      };
    };

    const userScopedProjects = projects.map((p) => ({
      ...p,
      mine: p.memberIds.includes(userId),
    }));

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
    const directoryStudents = students
      .filter((s) => s.id === userId || !discoverHiddenIds.includes(s.id))
      .map(publicStudent);
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
      findStudent: (id: string) => {
        const student = students.find((s) => s.id === id);
        return student ? publicStudent(student) : undefined;
      },
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
            if (platformSettings.autoFlagConnections) {
              const report: Report = {
                id: `r-${Date.now()}`,
                target: nameOf(id),
                targetId: id,
                kind: "User",
                reason: `Auto-flagged new connection with ${me.name}`,
                date: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" }),
                status: "Open",
              };
              setReports((reports) => [report, ...reports]);
              void insertReport(report);
            }
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
          .sort((a, b) => joinApplicationSortKey(b) - joinApplicationSortKey(a))[0];
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
        void insertCommunityJoinApplication(app);
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
        void syncCommunityJoinApplicationStatus(id, status);

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
        void insertCommunityPost(post, text.trim());
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
      saveCommunity: (community) => {
        if (getSessionPortal() !== "admin") {
          toast.error("Only ATL coordinators can update communities.");
          return;
        }
        setCommunities((prev) => prev.map((c) => (c.id === community.id ? community : c)));
        void updateCommunityRecord(community);
        toast.success("Community updated");
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

      projects: userScopedProjects,
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
      postProjectUpdate: (projectId, text) => {
        const trimmed = text.trim();
        if (!trimmed) return;
        setProjects((prev) => {
          const next = prev.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  updates: [
                    {
                      authorId: me.id,
                      text: trimmed,
                      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                    },
                    ...p.updates,
                  ],
                }
              : p,
          );
          const updated = next.find((p) => p.id === projectId);
          if (updated) void upsertProject(updated);
          return next;
        });
        toast.success("Update posted");
      },
      inviteToProject: (projectId, studentId) => {
        const project = projects.find((p) => p.id === projectId);
        if (!project || !project.memberIds.includes(userId)) {
          toast.error("Only project members can invite teammates.");
          return;
        }
        if (project.memberIds.includes(studentId)) {
          toast.message(`${nameOf(studentId)} is already on this project.`);
          return;
        }
        setProjects((prev) => {
          const next = prev.map((p) =>
            p.id === projectId ? { ...p, memberIds: [...p.memberIds, studentId] } : p,
          );
          const updated = next.find((p) => p.id === projectId);
          if (updated) void upsertProject(updated);
          return next;
        });
        setStudents((prev) => {
          const next = prev.map((s) =>
            s.id === studentId && !s.projects.includes(project.title)
              ? { ...s, projects: [...s.projects, project.title] }
              : s,
          );
          const updated = next.find((s) => s.id === studentId);
          if (updated) void syncStudentRecord(updated);
          return next;
        });
        notifyStudent(studentId, "project", `${me.name} invited you to “${project.title}”`);
        toast.success(`Invited ${nameOf(studentId)}`);
      },

      conversations,
      canMessageStudent,
      startConversation: (withId) => {
        if (!canMessageStudent(withId)) {
          toast.error(`${nameOf(withId)} is not accepting messages.`);
          return null;
        }
        const existing = conversations.find((c) => c.withId === withId);
        if (existing) return existing.id;
        const convo: Conversation = { id: withId, withId, unread: 0, messages: [] };
        setConversations((prev) => [convo, ...prev]);
        void ensureConversation(userId, withId);
        return withId;
      },
      sendMessage: (conversationId, text) => {
        if (!canMessageStudent(conversationId)) {
          toast.error(`${nameOf(conversationId)} is not accepting messages.`);
          return;
        }
        const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        setConversations((prev) => {
          const has = prev.some((c) => c.id === conversationId);
          const base = has
            ? prev
            : [{ id: conversationId, withId: conversationId, unread: 0, messages: [] }, ...prev];
          return base.map((c) =>
            c.id === conversationId
              ? { ...c, messages: [...c.messages, { fromMe: true, text, time }] }
              : c,
          );
        });
        void ensureConversation(userId, conversationId);
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
        const report = reports.find((r) => r.id === id);
        setReports((prev) => {
          if (status === "Dismissed" || status === "Restricted") {
            return prev.filter((r) => r.id !== id);
          }
          return prev.map((r) => (r.id === id ? { ...r, status } : r));
        });
        if (status === "Restricted" && report) {
          const studentId =
            report.targetId ??
            (report.kind === "User"
              ? students.find((s) => report.target.includes(s.name))?.id
              : undefined);
          if (studentId) {
            setStudents((prev) =>
              prev.map((s) => (s.id === studentId ? { ...s, status: "Inactive" } : s)),
            );
            void updateStudentStatus(studentId, "Inactive");
          }
        }
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
        if (draft.targetId) report.targetId = draft.targetId;
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
      saveEvent: (event) => {
        setEvents((prev) => prev.map((e) => (e.id === event.id ? event : e)));
        void updateEvent(event);
        toast.success("Event saved");
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
      saveOpportunity: (opportunity) => {
        setOpportunities((prev) => prev.map((o) => (o.id === opportunity.id ? opportunity : o)));
        void updateOpportunity(opportunity);
        toast.success("Opportunity saved");
      },
      publishIdea: (id) => {
        const idea = ideas.find((i) => i.id === id);
        if (!idea) return;
        setIdeas((prev) =>
          prev.map((i) =>
            i.id === id
              ? {
                  ...i,
                  reviewStatus: "published",
                  supports: Math.max(1, i.supports),
                  collaborators: Math.max(1, i.collaborators),
                  interested: i.interested.includes(i.creatorId)
                    ? i.interested
                    : [...i.interested, i.creatorId],
                }
              : i,
          ),
        );
        void publishIdeaLive(id, idea.creatorId);
        toast.success("Idea published to the school");
      },
      rejectIdea: (id) => {
        const idea = ideas.find((i) => i.id === id);
        if (!idea) return;
        setIdeas((prev) => prev.filter((i) => i.id !== id));
        void deleteIdeaLive(id);
        notifyStudent(idea.creatorId, "idea", `Your idea “${idea.title}” was not approved for the Idea Hub.`);
        toast.message("Idea rejected");
      },
      restrictStudent: (id) => {
        setStudents((prev) => {
          const next = prev.map((s) => (s.id === id ? { ...s, status: "Inactive" as const } : s));
          setLiveStudents(next);
          return next;
        });
        void updateStudentStatus(id, "Inactive");
        toast.message(`${nameOf(id)} marked inactive`);
      },
      reactivateStudent: (id) => {
        setStudents((prev) => {
          const next = prev.map((s) => (s.id === id ? { ...s, status: "Active" as const } : s));
          setLiveStudents(next);
          return next;
        });
        void updateStudentStatus(id, "Active");
        toast.message(`${nameOf(id)} reactivated`);
      },
      addStudent: (draft) => {
        if (!draft.name.trim()) {
          toast.error("Student name is required.");
          return;
        }
        const skills = draft.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        const interests = draft.interests
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        const id = uniqueSlug(draft.name, students.map((s) => s.id));
        const initials =
          draft.name
            .trim()
            .split(/\s+/)
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "ST";
        const student: Student = {
          id,
          name: draft.name.trim(),
          className: draft.className.trim() || "Class —",
          initials,
          bio: draft.bio.trim(),
          skills,
          interests,
          availability: draft.availability,
          projects: [],
          achievements: [],
          status: "Active",
          accent: "from-primary to-accent",
        };
        setStudents((prev) => {
          const next = [...prev, student].sort((a, b) => a.name.localeCompare(b.name));
          setLiveStudents(next);
          return next;
        });
        void insertStudent(student);
        pushActivity(`New student added: ${student.name}`);
        toast.success(`${student.name} added to directory`);
      },
      saveStudentRecord: (student) => {
        setStudents((prev) => {
          const next = prev
            .map((s) => (s.id === student.id ? student : s))
            .sort((a, b) => a.name.localeCompare(b.name));
          setLiveStudents(next);
          return next;
        });
        void syncStudentRecord(student);
        toast.success("Student record saved");
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
      publicStudent,
      studentSettings,
      exportUserData: () => {
        const payload = {
          profile: me,
          settings: studentSettings,
          connections,
          ideas: ideas.filter((i) => i.creatorId === userId),
          projects: projects.filter((p) => p.memberIds.includes(userId)),
          communities: joinedCommunities,
          notifications,
          exportedAt: new Date().toISOString(),
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `aavishkar-${userId}-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Your data export downloaded");
      },
      updateStudentSettings: (patch, opts) => {
        setStudentSettings((prev) => {
          const next = { ...prev, ...patch };
          void syncStudentSettings(userId, next);
          if (patch.showInDiscover !== undefined) {
            setDiscoverHiddenIds((ids) =>
              patch.showInDiscover ? ids.filter((i) => i !== userId) : [...new Set([...ids, userId])],
            );
          }
          if (
            patch.showClass !== undefined ||
            patch.allowMessages !== undefined ||
            patch.showProjectsPublic !== undefined
          ) {
            setStudentPrivacyMap((map) => ({
              ...map,
              [userId]: {
                showClass: next.showClass,
                allowMessages: next.allowMessages,
                showProjectsPublic: next.showProjectsPublic,
              },
            }));
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
    studentPrivacyMap,
  ]);

  if (requiresSupabaseConfig) {
    return <SupabaseConfigRequired />;
  }

  if (loadError) {
    return (
      <PlatformLoadError
        message={loadError}
        onRetry={() => {
          setLoadError(null);
          setLoadAttempt((n) => n + 1);
        }}
      />
    );
  }

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
