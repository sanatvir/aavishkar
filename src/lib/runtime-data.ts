import { INSTITUTION_NAME, PLATFORM_NAME } from "./brand";
import { communitiesWithLiveMemberCounts } from "./catalog";
import {
  adminActivity,
  adminEvents,
  communities as seedCommunities,
  opportunities as seedOpportunities,
  seedApplications,
  seedCommunityJoinApplications,
  seedCommunityMembers,
  seedCommunityPosts,
  seedConversations,
  seedIdeas,
  seedNotifications,
  seedProjects,
  seedRecruitments,
  seedReports,
  students as seedStudents,
  type Application,
  type Community,
  type CommunityJoinApplication,
  type CommunityPost,
  type Conversation,
  type Idea,
  type Notification,
  type Opportunity,
  type Project,
  type Recruitment,
  type Report,
  type Student,
} from "./mock-data";
import type { ActivityItem } from "./admin-metrics";
import { defaultStudentSettings, type PlatformEvent, type PlatformSettings } from "./supabase/store";
import { isSupabaseConfigured } from "./supabase/client";

/** Local dev without Supabase — in-memory demo using seed data. */
export const useOfflineDemo = !isSupabaseConfigured;

/** Production builds require Supabase env vars — no mock runtime. */
export const requiresSupabaseConfig = import.meta.env.PROD && !isSupabaseConfigured;

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

export type RuntimeBootstrap = {
  students: Student[];
  communities: Community[];
  opportunities: Opportunity[];
  connections: string[];
  joinedCommunities: string[];
  communityMembers: Record<string, string[]>;
  communityPosts: CommunityPost[];
  communityJoinApplications: CommunityJoinApplication[];
  ideas: Idea[];
  supported: string[];
  joinedIdeas: string[];
  projects: Project[];
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
  projectCreatedAt: Map<string, string>;
  studentSettings: ReturnType<typeof defaultStudentSettings>;
  platformSettings: PlatformSettings;
  discoverHiddenIds: string[];
};

export function createDemoRuntimeBootstrap(): RuntimeBootstrap {
  return {
    students: seedStudents,
    communities: communitiesWithLiveMemberCounts(seedCommunities, seedCommunityMembers),
    opportunities: seedOpportunities,
    connections: ["shaurya", "tanvi", "rehan", "ananya"],
    joinedCommunities: ["ai-ml", "robotics", "coding"],
    communityMembers: seedCommunityMembers,
    communityPosts: seedCommunityPosts,
    communityJoinApplications: seedCommunityJoinApplications,
    ideas: seedIdeas,
    supported: ["campus-air-map"],
    joinedIdeas: [],
    projects: seedProjects,
    conversations: seedConversations,
    notifications: seedNotifications,
    savedOpportunities: [],
    registeredOpportunities: [],
    shortlist: [],
    recruitments: seedRecruitments,
    applications: seedApplications,
    reports: seedReports,
    events: adminEvents.map((e, i) => ({ id: `event-${i}`, ...e, seats: e.seats })),
    activity: adminActivity,
    projectCreatedAt: new Map(),
    studentSettings: defaultStudentSettings(),
    platformSettings: defaultPlatformSettings(),
    discoverHiddenIds: [],
  };
}

export function createLiveRuntimeBootstrap(): RuntimeBootstrap {
  return {
    students: [],
    communities: [],
    opportunities: [],
    connections: [],
    joinedCommunities: [],
    communityMembers: {},
    communityPosts: [],
    communityJoinApplications: [],
    ideas: [],
    supported: [],
    joinedIdeas: [],
    projects: [],
    conversations: [],
    notifications: [],
    savedOpportunities: [],
    registeredOpportunities: [],
    shortlist: [],
    recruitments: [],
    applications: [],
    reports: [],
    events: [],
    activity: [],
    projectCreatedAt: new Map(),
    studentSettings: defaultStudentSettings(),
    platformSettings: defaultPlatformSettings(),
    discoverHiddenIds: [],
  };
}

export function createRuntimeBootstrap(): RuntimeBootstrap {
  return useOfflineDemo ? createDemoRuntimeBootstrap() : createLiveRuntimeBootstrap();
}
