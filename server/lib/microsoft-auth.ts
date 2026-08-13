import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const APSDK_EMAIL_SUFFIX = "@apsdk.edu.in";
const SESSION_TTL_MS = 5 * 60 * 1000;

export type MicrosoftAuthConfig = {
  enabled: boolean;
  reason?: string;
};

export function getMicrosoftAuthConfig(): MicrosoftAuthConfig {
  const clientId = process.env.AZURE_CLIENT_ID?.trim();
  const clientSecret = process.env.AZURE_CLIENT_SECRET?.trim();
  const tenantId = process.env.AZURE_TENANT_ID?.trim();
  const authSecret = process.env.AUTH_SECRET?.trim();

  if (!clientId || !clientSecret || !tenantId) {
    return {
      enabled: false,
      reason: "Missing AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, or AZURE_TENANT_ID.",
    };
  }

  if (!authSecret) {
    return {
      enabled: false,
      reason: "Missing AUTH_SECRET (random string used to sign login sessions).",
    };
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? process.env.VITE_SUPABASE_ANON_KEY?.trim();
  if (!supabaseUrl || !supabaseKey) {
    return {
      enabled: false,
      reason: "Missing Supabase URL or key for student roster lookup.",
    };
  }

  return { enabled: true };
}

function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret) throw new Error("AUTH_SECRET is not configured");
  return secret;
}

function getAzureConfig() {
  const clientId = process.env.AZURE_CLIENT_ID!.trim();
  const clientSecret = process.env.AZURE_CLIENT_SECRET!.trim();
  const tenantId = process.env.AZURE_TENANT_ID!.trim();
  return { clientId, clientSecret, tenantId };
}

export function getAppOrigin(request: Request): string {
  const configured = process.env.APP_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  return new URL(request.url).origin;
}

export function buildMicrosoftAuthorizeUrl(origin: string): string {
  const { clientId, tenantId } = getAzureConfig();
  const redirectUri = `${origin}/api/auth/microsoft/callback`;
  const state = createOAuthState();
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    response_mode: "query",
    scope: "openid profile email User.Read",
    state,
  });
  return `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?${params.toString()}`;
}

export function createOAuthState(): string {
  const nonce = randomBytes(16).toString("hex");
  const sig = createHmac("sha256", getAuthSecret()).update(nonce).digest("base64url");
  return `${nonce}.${sig}`;
}

export function verifyOAuthState(state: string): boolean {
  const [nonce, sig] = state.split(".");
  if (!nonce || !sig) return false;
  const expected = createHmac("sha256", getAuthSecret()).update(nonce).digest("base64url");
  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

type TokenResponse = {
  access_token?: string;
  id_token?: string;
  token_type?: string;
  error?: string;
  error_description?: string;
};

export async function exchangeMicrosoftCode(code: string, origin: string): Promise<TokenResponse> {
  const { clientId, clientSecret, tenantId } = getAzureConfig();
  const redirectUri = `${origin}/api/auth/microsoft/callback`;
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
    scope: "openid profile email User.Read",
  });

  const res = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  return (await res.json()) as TokenResponse;
}

function emailFromIdToken(idToken: string): string | null {
  const parts = idToken.split(".");
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[1]!, "base64url").toString("utf8")) as {
      email?: string;
      preferred_username?: string;
      upn?: string;
    };
    return (payload.email ?? payload.preferred_username ?? payload.upn ?? null)?.toLowerCase() ?? null;
  } catch {
    return null;
  }
}

async function emailFromGraph(accessToken: string): Promise<string | null> {
  const res = await fetch("https://graph.microsoft.com/v1.0/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { mail?: string; userPrincipalName?: string };
  return (data.mail ?? data.userPrincipalName ?? null)?.toLowerCase() ?? null;
}

function studentIdFromEmail(email: string): string {
  const normalized = email.trim().toLowerCase();
  if (normalized.endsWith(APSDK_EMAIL_SUFFIX)) {
    return normalized.slice(0, -APSDK_EMAIL_SUFFIX.length);
  }
  return normalized.split("@")[0] ?? normalized;
}

function getSupabaseAdmin() {
  const url = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? process.env.VITE_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) throw new Error("Supabase is not configured on the server");
  return createClient(url, key);
}

async function isRestrictSigninEnabled(): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from("platform_settings")
      .select("restrict_signin")
      .eq("id", "default")
      .maybeSingle();
    return data?.restrict_signin ?? true;
  } catch {
    return true;
  }
}

function isSchoolEmail(email: string): boolean {
  return email.endsWith(APSDK_EMAIL_SUFFIX);
}

async function resolveStudentId(email: string): Promise<string | null> {
  const studentId = studentIdFromEmail(email);
  const supabase = getSupabaseAdmin();
  const { data: student } = await supabase
    .from("students")
    .select("id, status, role")
    .eq("id", studentId)
    .maybeSingle();

  if (student?.status === "Active" && student.role !== "admin") return student.id;
  return null;
}

export async function completeMicrosoftLogin(code: string, state: string, origin: string) {
  if (!verifyOAuthState(state)) {
    return { ok: false as const, error: "Invalid sign-in state. Please try again." };
  }

  const tokens = await exchangeMicrosoftCode(code, origin);
  if (tokens.error) {
    return {
      ok: false as const,
      error: tokens.error_description ?? tokens.error ?? "Microsoft sign-in failed.",
    };
  }

  let email =
    (tokens.id_token ? emailFromIdToken(tokens.id_token) : null) ??
    (tokens.access_token ? await emailFromGraph(tokens.access_token) : null);

  if (!email) {
    return { ok: false as const, error: "Could not read your school email from Microsoft." };
  }

  if ((await isRestrictSigninEnabled()) && !isSchoolEmail(email)) {
    return {
      ok: false as const,
      error: `Only ${APSDK_EMAIL_SUFFIX} accounts can sign in to AAVISHKAR.`,
    };
  }

  const studentId = await resolveStudentId(email);
  if (!studentId) {
    return {
      ok: false as const,
      error: "No active AAVISHKAR student profile matches this Microsoft account.",
    };
  }

  const sessionToken = signSessionToken(studentId, email);
  return { ok: true as const, sessionToken, studentId, email };
}

export function signSessionToken(studentId: string, email: string): string {
  const payload = JSON.stringify({
    studentId,
    email,
    exp: Date.now() + SESSION_TTL_MS,
  });
  const payloadB64 = Buffer.from(payload).toString("base64url");
  const sig = createHmac("sha256", getAuthSecret()).update(payloadB64).digest("base64url");
  return `${payloadB64}.${sig}`;
}

export function verifySessionToken(token: string): { studentId: string; email: string } | null {
  const [payloadB64, sig] = token.split(".");
  if (!payloadB64 || !sig) return null;

  const expected = createHmac("sha256", getAuthSecret()).update(payloadB64).digest("base64url");
  try {
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  } catch {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8")) as {
      studentId?: string;
      email?: string;
      exp?: number;
    };
    if (!payload.studentId || !payload.email || !payload.exp || payload.exp < Date.now()) return null;
    return { studentId: payload.studentId, email: payload.email };
  } catch {
    return null;
  }
}
