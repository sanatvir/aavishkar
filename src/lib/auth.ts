import { students as seedStudents } from "./mock-data";
import { isSupabaseConfigured, supabase } from "./supabase/client";

export const DEFAULT_COORDINATOR_SIGN_IN_CODE = "apsdk-atl";

export type SignInStudent = {
  id: string;
  name: string;
  className: string;
  initials: string;
  accent: string;
};

export type SignInPolicy = {
  restrictSignin: boolean;
};

export async function loadSignInStudents(): Promise<SignInStudent[]> {
  if (!isSupabaseConfigured) {
    return seedStudents
      .filter((s) => s.status === "Active")
      .map((s) => ({
        id: s.id,
        name: s.name,
        className: s.className,
        initials: s.initials,
        accent: s.accent,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  const { data, error } = await supabase
    .from("students")
    .select("id, name, class_name, initials, accent, status, role")
    .eq("status", "Active")
    .neq("role", "admin")
    .order("name");

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    className: row.class_name,
    initials: row.initials,
    accent: row.accent,
  }));
}

export async function loadSignInPolicy(): Promise<SignInPolicy> {
  if (!isSupabaseConfigured) return { restrictSignin: true };

  const { data } = await supabase
    .from("platform_settings")
    .select("restrict_signin")
    .eq("id", "default")
    .maybeSingle();

  return { restrictSignin: data?.restrict_signin ?? true };
}

export async function verifyStudentSignIn(studentId: string, code?: string): Promise<boolean> {
  if (!isSupabaseConfigured) {
    const student = seedStudents.find((s) => s.id === studentId);
    if (!student || student.status !== "Active") return false;
    const { restrictSignin } = await loadSignInPolicy();
    if (!restrictSignin) return true;
    const normalized = code?.trim().toLowerCase();
    return normalized === studentId.toLowerCase() || normalized === "apsdk";
  }

  const [{ data: settings }, { data: student }] = await Promise.all([
    supabase.from("platform_settings").select("restrict_signin").eq("id", "default").maybeSingle(),
    supabase
      .from("students")
      .select("sign_in_code, status, role")
      .eq("id", studentId)
      .maybeSingle(),
  ]);

  if (!student || student.status !== "Active" || student.role === "admin") return false;
  if (!settings?.restrict_signin) return true;

  const expected = (student.sign_in_code ?? studentId).trim().toLowerCase();
  return code?.trim().toLowerCase() === expected;
}

export async function verifyCoordinatorSignIn(code: string): Promise<boolean> {
  const normalized = code.trim();
  if (!normalized) return false;

  if (!isSupabaseConfigured) {
    return normalized === DEFAULT_COORDINATOR_SIGN_IN_CODE;
  }

  const { data } = await supabase
    .from("platform_settings")
    .select("coordinator_sign_in_code")
    .eq("id", "default")
    .maybeSingle();

  const expected = data?.coordinator_sign_in_code ?? DEFAULT_COORDINATOR_SIGN_IN_CODE;
  return normalized === expected;
}

export async function updateStudentSignInCode(studentId: string, signInCode: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  const normalized = signInCode.trim().toLowerCase();
  if (!normalized) return false;

  const { error } = await supabase.from("students").update({ sign_in_code: normalized }).eq("id", studentId);
  return !error;
}

export async function loadStudentSignInCode(studentId: string): Promise<string | null> {
  if (!isSupabaseConfigured) return studentId.toLowerCase();

  const { data } = await supabase.from("students").select("sign_in_code").eq("id", studentId).maybeSingle();
  return data?.sign_in_code ?? null;
}
