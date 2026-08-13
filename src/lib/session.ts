import { isSupabaseConfigured } from "./supabase/client";

const SESSION_KEY = "aavishkar_user";
const PORTAL_KEY = "aavishkar_portal";

export const DEMO_STUDENT_ID = "sanatvir";
/** Author id for coordinator posts in community feeds */
export const COORDINATOR_AUTHOR_ID = "coordinator";

export type Portal = "student" | "admin";

export function hasStudentSession(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(PORTAL_KEY) === "student" && Boolean(localStorage.getItem(SESSION_KEY));
}

export function hasAdminSession(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(PORTAL_KEY) === "admin";
}

export function getSessionUserId(): string {
  if (typeof window === "undefined") return DEMO_STUDENT_ID;
  const id = localStorage.getItem(SESSION_KEY);
  if (id) return id;
  if (!isSupabaseConfigured) return DEMO_STUDENT_ID;
  return DEMO_STUDENT_ID;
}

export function getSessionPortal(): Portal {
  if (typeof window === "undefined") return "student";
  const portal = localStorage.getItem(PORTAL_KEY);
  return portal === "admin" ? "admin" : "student";
}

export function setStudentSession(userId: string) {
  localStorage.setItem(SESSION_KEY, userId);
  localStorage.setItem(PORTAL_KEY, "student");
}

export function setCoordinatorSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.setItem(PORTAL_KEY, "admin");
}

/** @deprecated use setStudentSession */
export function setSessionUserId(id: string) {
  setStudentSession(id);
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(PORTAL_KEY);
}
