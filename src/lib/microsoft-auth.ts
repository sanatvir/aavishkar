import { isSupabaseConfigured, supabase } from "./supabase/client";
import { DEMO_STUDENT_ID, setStudentSession } from "./session";

const APSDK_EMAIL_SUFFIX = "@apsdk.edu.in";

/** Set `VITE_ENABLE_MICROSOFT_AUTH=true` after Azure is configured in Supabase Auth. */
export const isMicrosoftAuthEnabled =
  import.meta.env.VITE_ENABLE_MICROSOFT_AUTH === "true" && isSupabaseConfigured;

export type MicrosoftSignInResult = "redirect" | "demo";

export async function signInWithMicrosoft(): Promise<MicrosoftSignInResult> {
  if (isMicrosoftAuthEnabled) {
    const redirectTo = `${window.location.origin}/auth/callback`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "azure",
      options: {
        redirectTo,
        scopes: "email openid profile",
      },
    });
    if (error) throw error;
    return "redirect";
  }

  setStudentSession(DEMO_STUDENT_ID);
  return "demo";
}

function studentIdFromEmail(email: string): string {
  const normalized = email.trim().toLowerCase();
  if (normalized.endsWith(APSDK_EMAIL_SUFFIX)) {
    return normalized.slice(0, -APSDK_EMAIL_SUFFIX.length);
  }
  return normalized.split("@")[0] ?? normalized;
}

/** After OAuth redirect, map the Microsoft account to a roster student id. */
export async function completeMicrosoftAuthCallback(): Promise<string | null> {
  if (!isSupabaseConfigured) return null;

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error || !session?.user?.email) return null;

  const studentId = studentIdFromEmail(session.user.email);
  const { data: student } = await supabase
    .from("students")
    .select("id, status")
    .eq("id", studentId)
    .maybeSingle();

  if (student?.status === "Active") return student.id;

  // Fallback: first active student with matching email prefix in id
  const { data: roster } = await supabase.from("students").select("id, status").eq("status", "Active");
  const match = (roster ?? []).find((s) => s.id === studentId);
  return match?.id ?? null;
}

export async function signOutMicrosoftAuth() {
  if (isSupabaseConfigured) {
    await supabase.auth.signOut();
  }
}
