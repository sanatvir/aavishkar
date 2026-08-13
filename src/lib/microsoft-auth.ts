import { isSupabaseConfigured } from "./supabase/client";
import { DEMO_STUDENT_ID, setStudentSession } from "./session";

export type MicrosoftSignInResult = "redirect" | "demo";

type AuthConfigResponse = {
  enabled: boolean;
  reason?: string;
};

export async function fetchMicrosoftAuthConfig(): Promise<AuthConfigResponse> {
  try {
    const res = await fetch("/api/auth/config");
    if (!res.ok) {
      return { enabled: false, reason: "Auth server unavailable." };
    }
    return (await res.json()) as AuthConfigResponse;
  } catch {
    return { enabled: false, reason: "Could not reach the auth server." };
  }
}

export async function signInWithMicrosoft(): Promise<MicrosoftSignInResult> {
  const config = await fetchMicrosoftAuthConfig();

  if (config.enabled) {
    window.location.href = "/api/auth/microsoft";
    return "redirect";
  }

  if (!isSupabaseConfigured) {
    setStudentSession(DEMO_STUDENT_ID);
    return "demo";
  }

  throw new Error(
    config.reason ??
      "Microsoft sign-in is not configured. Add Azure keys and AUTH_SECRET to the server environment.",
  );
}

export async function verifyAuthSessionToken(
  token: string,
): Promise<{ studentId: string; email: string } | null> {
  const res = await fetch("/api/auth/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });

  if (!res.ok) return null;

  const data = (await res.json()) as { ok?: boolean; studentId?: string; email?: string };
  if (!data.ok || !data.studentId || !data.email) return null;
  return { studentId: data.studentId, email: data.email };
}

export async function signOutMicrosoftAuth() {
  // Server sessions are one-time tokens; clearing local portal session is enough.
}
