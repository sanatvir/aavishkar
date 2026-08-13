import { isSupabaseConfigured } from "./supabase/client";
import { currentUser as demoUser, students as demoStudents, type Student } from "./mock-data";
import { getSessionUserId } from "./session";

let liveStudents: Student[] | null = null;

export function setLiveStudents(list: Student[]) {
  liveStudents = list;
}

export function getStudents(): Student[] {
  if (isSupabaseConfigured) return liveStudents ?? [];
  return liveStudents ?? demoStudents;
}

function placeholderStudent(id: string): Student {
  return {
    id,
    name: "Student",
    className: "",
    initials: "?",
    bio: "",
    skills: [],
    interests: [],
    availability: "Available",
    projects: [],
    achievements: [],
    status: "Active",
    accent: "from-primary to-accent",
  };
}

export function getCurrentUser(): Student {
  const id = getSessionUserId();
  if (!id) {
    return placeholderStudent("__guest__");
  }
  const found = getStudents().find((s) => s.id === id);
  if (found) return found;
  if (isSupabaseConfigured) return placeholderStudent(id);
  return demoUser;
}

export function findStudentById(id: string): Student | undefined {
  return getStudents().find((s) => s.id === id);
}
