const SESSION_KEY = "aavishkar_user";
const PORTAL_KEY = "aavishkar_portal";

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
}

export function getSessionPortal(): Portal {
  if (typeof window === "undefined") return "student";
  const portal = localStorage.getItem(PORTAL_KEY);
  return portal === "admin" ? "admin" : "student";
}

export function hasAdminSession(): boolean {
  return getSessionPortal() === "admin";
}

/** Open admin access — sets portal when deep-linking to /admin without using the landing button. */
export function ensureCoordinatorSession(): void {
  if (typeof window === "undefined") return;
  if (getSessionPortal() === "admin") return;
  setCoordinatorSession();
}

export function setStudentSession(userId: string = DEMO_STUDENT_ID) {
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
