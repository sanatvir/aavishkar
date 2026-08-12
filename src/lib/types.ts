export type Student = {
  id: string;
  name: string;
  className: string;
  initials: string;
  bio: string;
  skills: string[];
  interests: string[];
  availability: "Available" | "Busy" | "Open to teams";
  projects: string[];
  achievements: string[];
  status: "Active" | "Inactive";
  accent: string;
  avatarUrl?: string;
  createdAt?: string;
};

export type Idea = {
  id: string;
  title: string;
  category: string;
  problem: string;
  solution: string;
  why: string;
  lookingFor: string[];
  technologies: string[];
  creatorId: string;
  supports: number;
  collaborators: number;
  interested: string[];
  comments: { id: string; authorId: string; text: string; time: string }[];
  reviewStatus?: "published" | "pending";
};

export type Task = { id: string; title: string; done: boolean; inProgress?: boolean };

export type ProjectFile = { name: string; size: string; by: string; date: string; url?: string };

export type Project = {
  id: string;
  title: string;
  description: string;
  status: "Active" | "Planning" | "Completed";
  progress: number;
  memberIds: string[];
  deadline: string;
  milestones: { label: string; date: string; done: boolean }[];
  tasks: Task[];
  files: ProjectFile[];
  updates: { authorId: string; text: string; time: string }[];
  chat: { authorId: string; text: string; time: string }[];
  mine: boolean;
};

export type Community = {
  id: string;
  name: string;
  members: number;
  description: string;
  activity: string[];
  accent: string;
};

export type Opportunity = {
  id: string;
  title: string;
  type: string;
  deadline: string;
  description: string;
  eligibility: string;
  skills: string[];
  organizer: string;
};

export type Conversation = {
  id: string;
  withId: string;
  unread: number;
  messages: { fromMe: boolean; text: string; time: string }[];
};

export type Notification = {
  id: string;
  kind: "connection" | "project" | "recruitment" | "opportunity" | "community" | "idea" | "message";
  text: string;
  time: string;
  read: boolean;
};

export type Application = {
  id: string;
  studentId: string;
  recruitmentId: string;
  submitted: string;
  note: string;
  stage: "New" | "Reviewed" | "Shortlisted" | "Accepted" | "Rejected";
};

export type Recruitment = {
  id: string;
  title: string;
  status: "Applications Open" | "Shortlisting" | "Closed";
  skills: string[];
  applications: number;
  closes: string;
  description: string;
};

export type Report = {
  id: string;
  target: string;
  kind: "User" | "Comment" | "Idea";
  reason: string;
  date: string;
  status: "Open" | "Dismissed" | "Restricted" | "Reviewing";
};

export type NewReport = {
  target: string;
  kind: Report["kind"];
  reason: string;
};

export type NewRecruitment = {
  title: string;
  description: string;
  skills: string;
  closes: string;
};

export type NewOpportunity = {
  title: string;
  type: string;
  deadline: string;
  description: string;
  eligibility: string;
  skills: string;
  organizer: string;
};

export type NewEvent = {
  title: string;
  date: string;
  place: string;
  seatsTotal: string;
};
