import { redirect } from "@tanstack/react-router";

const SESSION_KEY = "aavishkar_user";
const PORTAL_KEY = "aavishkar_portal";
const COORDINATOR_KEY = "aavishkar_coordinator";

export const DEMO_STUDENT_ID = "sanatvir";
/** Author id for coordinator posts in community feeds */
export const COORDINATOR_AUTHOR_ID = "coordinator";

export type Portal = "student" | "admin";

export function getSessionUserId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SESSION_KEY);
}

export function hasStudentSession(): boolean {
  return getSessionUserId() != null;
}

export function beginStudentJoin() {
  localStorage.setItem(PORTAL_KEY, "student");
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(COORDINATOR_KEY);
}

export function getSessionPortal(): Portal {
  if (typeof window === "undefined") return "student";
  if (localStorage.getItem(COORDINATOR_KEY)) return "admin";
  const portal = localStorage.getItem(PORTAL_KEY);
  return portal === "admin" ? "admin" : "student";
}

export function hasAdminSession(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(COORDINATOR_KEY) != null;
}

/**
 * Guard for /admin routes. Only allows access when a coordinator session was
 * deliberately established (via the landing "Admin login" button). It never
 * auto-grants admin, so a normal student who visits /admin is bounced back.
 */
export function ensureCoordinatorSession(): void {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(COORDINATOR_KEY)) return;
  throw redirect({ to: hasStudentSession() ? "/app" : "/" });
}

export function setStudentSession(userId: string = DEMO_STUDENT_ID) {
  localStorage.setItem(SESSION_KEY, userId);
  localStorage.setItem(PORTAL_KEY, "student");
  localStorage.removeItem(COORDINATOR_KEY);
}

export function setCoordinatorSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.setItem(PORTAL_KEY, "admin");
  localStorage.setItem(COORDINATOR_KEY, "1");
}

/** @deprecated use setStudentSession */
export function setSessionUserId(id: string) {
  setStudentSession(id);
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(PORTAL_KEY);
  localStorage.removeItem(COORDINATOR_KEY);
}
