const SESSION_KEY = "aavishkar_user";
const PORTAL_KEY = "aavishkar_portal";

export const DEMO_STUDENT_ID = "sanatvir";

export type Portal = "student" | "admin";

export function getSessionUserId(): string {
  if (typeof window === "undefined") return DEMO_STUDENT_ID;
  return localStorage.getItem(SESSION_KEY) ?? DEMO_STUDENT_ID;
}

export function getSessionPortal(): Portal {
  if (typeof window === "undefined") return "student";
  const portal = localStorage.getItem(PORTAL_KEY);
  return portal === "admin" ? "admin" : "student";
}

export function setStudentSession(userId: string = DEMO_STUDENT_ID) {
  localStorage.setItem(SESSION_KEY, userId);
  localStorage.setItem(PORTAL_KEY, "student");
}

export function setCoordinatorSession() {
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
