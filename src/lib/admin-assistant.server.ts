import { z } from "zod";
import { INSTITUTION_NAME, PLATFORM_NAME } from "@/lib/brand";
import type {
  AdminAssistantInput,
  AdminAssistantResult,
  AssistantSource,
  PlatformContext,
} from "@/lib/admin-assistant-context";
import {
  ALL_PROVIDERS_RATE_LIMITED,
  ASSISTANT_SERVER_UNAVAILABLE,
} from "@/lib/admin-assistant-context";
import {
  buildAssistantSystemPrompt,
  buildTeamRecommendationReply,
  isWeakAssistantReply,
  normalizeAssistantReply,
  normalizeFollowUps,
  normalizeTeamReason,
} from "@/lib/admin-assistant-voice";

export const DEFAULT_GROQ_MODEL = "llama-3.1-8b-instant";
export const GROQ_MODEL_QUALITY = "llama-3.3-70b-versatile";
export const OPENROUTER_MODEL_OPENAI = "openai/gpt-oss-20b:free";
export const OPENROUTER_MODEL_NVIDIA = "nvidia/nemotron-3.5-lightning:free";

const GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions";
const OPENROUTER_CHAT_URL = "https://openrouter.ai/api/v1/chat/completions";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(8000),
});

const platformContextSchema = z.object({
  snapshotAt: z.string(),
  platform: z.object({
    name: z.string(),
    institution: z.string(),
    coordinatorName: z.string(),
  }),
  stats: z.array(z.object({ label: z.string(), value: z.number(), delta: z.string() })),
  topSkills: z.array(z.object({ skill: z.string(), students: z.number() })),
  recentActivity: z.array(z.object({ text: z.string(), time: z.string() })),
  students: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      className: z.string(),
      skills: z.array(z.string()),
      interests: z.array(z.string()),
      availability: z.enum(["Available", "Busy", "Open to teams"]),
      status: z.enum(["Active", "Inactive"]),
    }),
  ),
  pendingIdeas: z.array(
    z.object({ id: z.string(), title: z.string(), category: z.string(), creatorId: z.string() }),
  ),
  projects: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      status: z.enum(["Active", "Planning", "Completed"]),
      progress: z.number(),
      memberCount: z.number(),
      deadline: z.string(),
    }),
  ),
  recruitments: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      status: z.enum(["Applications Open", "Shortlisting", "Closed"]),
      skills: z.array(z.string()),
      closes: z.string(),
      applications: z.number(),
    }),
  ),
  pendingApplications: z.array(
    z.object({
      id: z.string(),
      studentId: z.string(),
      recruitmentTitle: z.string(),
      stage: z.enum(["New", "Reviewed", "Shortlisted", "Accepted", "Rejected"]),
    }),
  ),
  openReports: z.array(
    z.object({
      id: z.string(),
      target: z.string(),
      kind: z.enum(["User", "Comment", "Idea"]),
      status: z.enum(["Open", "Dismissed", "Restricted", "Reviewing"]),
    }),
  ),
  upcomingEvents: z.array(
    z.object({ id: z.string(), title: z.string(), date: z.string(), place: z.string() }),
  ),
  opportunities: z.array(
    z.object({ id: z.string(), title: z.string(), type: z.string(), deadline: z.string() }),
  ),
  communities: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      memberCount: z.number(),
      memberIds: z.array(z.string()),
      recentActivity: z.array(z.string()),
      pendingJoinApplications: z.number(),
    }),
  ),
});

export const adminAssistantInputSchema = z.object({
  messages: z.array(messageSchema).min(1).max(24),
  context: platformContextSchema,
});

export type { AdminAssistantInput, AdminAssistantResult, AssistantSource } from "@/lib/admin-assistant-context";

type ModelPayload = Omit<AdminAssistantResult, "source" | "errorKind">;

type ProviderError = Error & {
  errorKind?: AdminAssistantResult["errorKind"];
  retryable?: boolean;
};

const SYSTEM_PROMPT = buildAssistantSystemPrompt();

function studentNameMap(context: PlatformContext) {
  return new Map(context.students.map((s) => [s.id, s.name]));
}

function validateTeamRecommendations(
  raw: unknown,
  context: PlatformContext,
): { studentId: string; reason: string }[] {
  const activeIds = new Set(
    context.students.filter((s) => s.status === "Active").map((s) => s.id),
  );
  if (!Array.isArray(raw)) return [];

  const out: { studentId: string; reason: string }[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const { studentId, reason } = item as { studentId?: unknown; reason?: unknown };
    if (typeof studentId !== "string" || typeof reason !== "string") continue;
    if (!activeIds.has(studentId)) continue;
    out.push({ studentId, reason: normalizeTeamReason(reason) });
    if (out.length >= 4) break;
  }
  return out;
}

function parseJsonContent(content: string): unknown {
  let trimmed = content.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/i);
  if (fenced) trimmed = fenced[1].trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
    throw new Error("Invalid JSON");
  }
}

function extractReplyField(obj: Record<string, unknown>): string {
  for (const key of ["reply", "message", "answer", "response"]) {
    const val = obj[key];
    if (typeof val === "string" && val.trim()) return val.trim();
  }
  return "";
}

function parseModelResponse(
  content: string,
  context: PlatformContext,
  lastUserMessage = "",
): ModelPayload {
  let parsed: unknown;
  try {
    parsed = parseJsonContent(content);
  } catch {
    return {
      reply: content.trim() || "I couldn't parse a response. Please try again.",
      teamRecommendations: [],
      suggestedFollowUps: [],
    };
  }

  const obj = parsed as Record<string, unknown>;

  let reply = normalizeAssistantReply(extractReplyField(obj));

  const teamRecommendations = validateTeamRecommendations(obj.teamRecommendations, context);

  const suggestedFollowUps = normalizeFollowUps(
    Array.isArray(obj.suggestedFollowUps)
      ? obj.suggestedFollowUps.filter((s): s is string => typeof s === "string")
      : [],
  );

  const names = studentNameMap(context);

  if (teamRecommendations.length > 0 && isWeakAssistantReply(reply)) {
    reply = buildTeamRecommendationReply(
      teamRecommendations.map((r) => ({
        name: names.get(r.studentId) ?? r.studentId,
        reason: r.reason,
      })),
      lastUserMessage,
    );
  } else if (
    teamRecommendations.length > 0 &&
    !reply.toLowerCase().includes("recommend") &&
    !reply.includes("**")
  ) {
    reply = `${reply}\n\n${buildTeamRecommendationReply(
      teamRecommendations.map((r) => ({
        name: names.get(r.studentId) ?? r.studentId,
        reason: r.reason,
      })),
      lastUserMessage,
    )}`;
  }

  return { reply, teamRecommendations, suggestedFollowUps };
}

function buildChatMessages(
  messages: AdminAssistantInput["messages"],
  context: PlatformContext,
) {
  const history = messages.slice(-12).map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  return [
    { role: "system" as const, content: SYSTEM_PROMPT },
    {
      role: "user" as const,
      content: `Live platform snapshot (JSON) — snapshotAt: ${context.snapshotAt}. This is the coordinator's real-time app data at request time. Use ONLY this data; never invent students, counts, or projects.\n\n${JSON.stringify(context)}\n\nConversation follows.`,
    },
    ...history,
  ];
}

function parseChatError(
  provider: string,
  status: number,
  detail: string,
): { kind: AdminAssistantResult["errorKind"]; message: string; retryable: boolean } {
  let apiMessage = "";
  try {
    const body = JSON.parse(detail) as { error?: { message?: string } };
    apiMessage = body.error?.message ?? "";
  } catch {
    /* ignore */
  }

  const lower = apiMessage.toLowerCase();

  if (status === 401 || lower.includes("invalid api key") || lower.includes("unauthorized")) {
    return {
      kind: "auth",
      message: `${provider} API key invalid`,
      retryable: false,
    };
  }

  if (status === 429 || lower.includes("rate limit") || lower.includes("quota")) {
    return {
      kind: "rate_limit",
      message: `${provider} rate limit reached`,
      retryable: true,
    };
  }

  if (status >= 500 || status === 408 || status === 503) {
    return {
      kind: "network",
      message: `${provider} temporarily unavailable (HTTP ${status})`,
      retryable: true,
    };
  }

  return {
    kind: "unknown",
    message: apiMessage || `${provider} request failed (HTTP ${status})`,
    retryable: status >= 500,
  };
}

function providerError(
  provider: string,
  status: number,
  detail: string,
): ProviderError {
  const parsed = parseChatError(provider, status, detail);
  const err = new Error(parsed.message) as ProviderError;
  err.errorKind = parsed.kind;
  err.retryable = parsed.retryable;
  return err;
}

async function callChatCompletions(
  url: string,
  apiKey: string,
  model: string,
  messages: AdminAssistantInput["messages"],
  context: PlatformContext,
  providerLabel: string,
  extraHeaders?: Record<string, string>,
): Promise<ModelPayload> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...extraHeaders,
    },
    body: JSON.stringify({
      model,
      temperature: 0.35,
      max_tokens: 1800,
      response_format: { type: "json_object" },
      messages: buildChatMessages(messages, context),
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw providerError(providerLabel, response.status, detail);
  }

  const body = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = body.choices?.[0]?.message?.content;
  if (!content) throw new Error(`${providerLabel} returned an empty response`);

  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  return parseModelResponse(content, context, lastUser);
}

async function callGroq(
  messages: AdminAssistantInput["messages"],
  context: PlatformContext,
): Promise<ModelPayload> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not configured");

  const model = process.env.GROQ_MODEL ?? DEFAULT_GROQ_MODEL;
  return callChatCompletions(GROQ_CHAT_URL, apiKey, model, messages, context, "Groq");
}

async function callOpenRouter(
  model: string,
  providerLabel: string,
  messages: AdminAssistantInput["messages"],
  context: PlatformContext,
): Promise<ModelPayload> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not configured");

  return callChatCompletions(
    OPENROUTER_CHAT_URL,
    apiKey,
    model,
    messages,
    context,
    providerLabel,
    {
      "HTTP-Referer": process.env.APP_URL ?? "http://localhost:3000",
      "X-Title": `${PLATFORM_NAME} Admin Assistant`,
    },
  );
}

type ProviderStep = {
  source: AssistantSource;
  label: string;
  run: () => Promise<ModelPayload>;
};

function getProviderChain(
  messages: AdminAssistantInput["messages"],
  context: PlatformContext,
): ProviderStep[] {
  const chain: ProviderStep[] = [];

  if (process.env.GROQ_API_KEY?.trim()) {
    chain.push({
      source: "groq",
      label: "Groq",
      run: () => callGroq(messages, context),
    });
  }

  if (process.env.OPENROUTER_API_KEY?.trim()) {
    chain.push({
      source: "openai",
      label: "OpenAI",
      run: () =>
        callOpenRouter(
          process.env.OPENROUTER_MODEL_OPENAI ?? OPENROUTER_MODEL_OPENAI,
          "OpenAI",
          messages,
          context,
        ),
    });

    chain.push({
      source: "nvidia",
      label: "NVIDIA",
      run: () =>
        callOpenRouter(
          process.env.OPENROUTER_MODEL_NVIDIA ?? OPENROUTER_MODEL_NVIDIA,
          "NVIDIA",
          messages,
          context,
        ),
    });
  }

  return chain;
}

function providerFailureResult(
  lastErrorKind: AdminAssistantResult["errorKind"],
): AdminAssistantResult {
  if (lastErrorKind === "auth") {
    return {
      reply:
        "AI provider API keys are invalid or missing. Check `GROQ_API_KEY` and `OPENROUTER_API_KEY` in `.env`, then restart the dev server.",
      teamRecommendations: [],
      suggestedFollowUps: [],
      errorKind: "auth",
    };
  }

  if (lastErrorKind === "rate_limit" || lastErrorKind === "quota") {
    return {
      reply: ALL_PROVIDERS_RATE_LIMITED,
      teamRecommendations: [],
      suggestedFollowUps: [],
      errorKind: "rate_limit",
    };
  }

  return {
    reply: ASSISTANT_SERVER_UNAVAILABLE,
    teamRecommendations: [],
    suggestedFollowUps: [],
    errorKind: lastErrorKind ?? "network",
  };
}

export async function runAdminAssistant(input: AdminAssistantInput): Promise<AdminAssistantResult> {
  const { messages, context } = input;
  const chain = getProviderChain(messages, context);

  if (chain.length === 0) {
    return providerFailureResult("auth");
  }

  let lastErrorKind: AdminAssistantResult["errorKind"] = "unknown";

  for (const step of chain) {
    try {
      const result = await step.run();
      return { ...result, source: step.source };
    } catch (error) {
      console.error(`[admin-assistant] ${step.label} failed:`, error);
      const err = error as ProviderError;
      lastErrorKind = err.errorKind ?? "unknown";
    }
  }

  return providerFailureResult(lastErrorKind);
}
