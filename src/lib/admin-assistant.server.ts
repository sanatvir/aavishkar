import { z } from "zod";
import { INSTITUTION_NAME, PLATFORM_NAME } from "@/lib/brand";
import { recommendTeam } from "@/lib/recommendations";
import type { PlatformContext } from "@/lib/admin-assistant-context";

/** Default — best free-tier daily quota (~14.4k requests/day). */
export const DEFAULT_GROQ_MODEL = "llama-3.1-8b-instant";

/** Smarter drafts/reasoning — lower free daily cap (~1k requests/day). */
export const GROQ_MODEL_QUALITY = "llama-3.3-70b-versatile";

const GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(8000),
});

const platformContextSchema = z.object({
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
});

export const adminAssistantInputSchema = z.object({
  messages: z.array(messageSchema).min(1).max(24),
  context: platformContextSchema,
});

export type AdminAssistantInput = z.infer<typeof adminAssistantInputSchema>;

export type AdminAssistantResult = {
  reply: string;
  teamRecommendations: { studentId: string; reason: string }[];
  suggestedFollowUps: string[];
  source: "groq" | "offline";
  errorKind?: "quota" | "auth" | "rate_limit" | "network" | "unknown";
};

const SYSTEM_PROMPT = `You are the ${PLATFORM_NAME} Admin Assistant — a friendly AI copilot for ATL coordinators at ${INSTITUTION_NAME}.

Talk like a normal, helpful chat assistant: warm, clear, and conversational. Use the coordinator's first name when you know it.

When they greet you (hi, hello, thanks, etc.) or make small talk:
- Reply naturally in 1–3 sentences.
- Briefly say who you are and offer to help.
- Do NOT dump platform stats or JSON unless they asked for data.

When they ask about the platform (students, projects, ideas, recruitment, events, reports):
- Use ONLY the platform snapshot JSON provided. Never invent students, projects, or stats.
- Refer to students by name; include studentId in teamRecommendations when recommending people.
- Be concise and actionable. Use markdown: **bold**, bullet lists, numbered steps.
- For team-building, return teamRecommendations (up to 4 active students with valid studentIds).
- For drafts (recruitment posts, events, announcements), put the draft in reply.
- If data is empty or missing, say so plainly — don't sound like a error log.

Stay focused on school innovation / ATL coordinator work, but casual conversation is fine.

Respond with JSON only:
{
  "reply": "markdown answer",
  "teamRecommendations": [{ "studentId": "...", "reason": "..." }] or [],
  "suggestedFollowUps": ["short follow-up question", "..."] (0-3 items, optional on greetings)
}`;

function isCasualMessage(text: string): boolean {
  const t = text.trim().toLowerCase().replace(/[!?.]+$/g, "").trim();
  if (/^(hi|hello|hey|hiya|howdy|yo|sup|good morning|good afternoon|good evening)$/.test(t)) {
    return true;
  }
  if (/^(thanks|thank you|thx|ok|okay|cool|great|nice|got it|sure)$/.test(t)) {
    return true;
  }
  if (/^(what can you do|what do you do|help me|help|who are you|what are you)$/.test(t)) {
    return true;
  }
  return t.length <= 12 && /^(hi|hello|hey)\b/.test(t);
}

function casualReply(context: PlatformContext, lastUser: string): AdminAssistantResult {
  const firstName = context.platform.coordinatorName.split(/\s+/)[0] || "there";
  const lower = lastUser.trim().toLowerCase();

  if (/thank/.test(lower)) {
    return {
      reply: "You're welcome! Ask me anything about students, projects, recruitment, or drafts whenever you need.",
      teamRecommendations: [],
      suggestedFollowUps: ["What should I prioritize today?", "Recommend a team for a robotics project"],
      source: "offline",
    };
  }

  if (/what can you|what do you|who are you|help/.test(lower)) {
    return {
      reply: `I'm your **${PLATFORM_NAME} admin assistant** — I help ATL coordinators at ${INSTITUTION_NAME} with things like:\n\n- Finding and recommending students for projects\n- Summarizing platform activity and priorities\n- Drafting recruitment posts and announcements\n- Answering questions about ideas, applications, and reports\n\nJust ask in plain language — e.g. *"Who knows robotics?"* or *"Hello!"*`,
      teamRecommendations: [],
      suggestedFollowUps: ["Hello!", "What should I prioritize today?"],
      source: "offline",
    };
  }

  return {
    reply: `Hello, **${firstName}**! Good to hear from you. I'm your ${PLATFORM_NAME} admin assistant — I can help with student teams, platform stats, idea reviews, recruitment drafts, and more.\n\nWhat would you like to work on?`,
    teamRecommendations: [],
    suggestedFollowUps: ["What should I prioritize today?", "Recommend a team for an AI project"],
    source: "offline",
  };
}

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
    out.push({ studentId, reason: reason.trim().slice(0, 500) });
    if (out.length >= 4) break;
  }
  return out;
}

function parseModelResponse(content: string, context: PlatformContext): Omit<AdminAssistantResult, "source"> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    return {
      reply: content.trim() || "I couldn't parse a response. Please try again.",
      teamRecommendations: [],
      suggestedFollowUps: [],
    };
  }

  const obj = parsed as {
    reply?: unknown;
    teamRecommendations?: unknown;
    suggestedFollowUps?: unknown;
  };

  const reply =
    typeof obj.reply === "string" && obj.reply.trim()
      ? obj.reply.trim()
      : "I couldn't generate a reply. Please try rephrasing your question.";

  const teamRecommendations = validateTeamRecommendations(obj.teamRecommendations, context);

  const suggestedFollowUps = Array.isArray(obj.suggestedFollowUps)
    ? obj.suggestedFollowUps
        .filter((s): s is string => typeof s === "string" && s.trim().length > 0)
        .slice(0, 3)
    : [];

  const names = studentNameMap(context);
  const enrichedReply =
    teamRecommendations.length > 0 && !reply.toLowerCase().includes("recommend")
      ? `${reply}\n\n**Suggested team:** ${teamRecommendations.map((r) => names.get(r.studentId) ?? r.studentId).join(", ")}.`
      : reply;

  return { reply: enrichedReply, teamRecommendations, suggestedFollowUps };
}

async function callGroq(
  messages: AdminAssistantInput["messages"],
  context: PlatformContext,
): Promise<Omit<AdminAssistantResult, "source">> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not configured");

  const model = process.env.GROQ_MODEL ?? DEFAULT_GROQ_MODEL;
  const history = messages.slice(-12).map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));
  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const casual = isCasualMessage(lastUser);

  const contextIntro = casual
    ? `Coordinator: ${context.platform.coordinatorName}. Platform: ${PLATFORM_NAME} at ${context.platform.institution}. They sent a casual message — reply warmly; full platform data is available when they ask specific questions.`
    : `Platform snapshot (JSON):\n${JSON.stringify(context)}\n\nAnswer the latest user message using this data.`;

  const response = await fetch(GROQ_CHAT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.35,
      max_tokens: 1800,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `${contextIntro}\n\nConversation follows.`,
        },
        ...history,
      ],
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    const parsed = parseGroqError(response.status, detail);
    const err = new Error(parsed.message) as Error & { errorKind?: AdminAssistantResult["errorKind"] };
    err.errorKind = parsed.kind;
    throw err;
  }

  const body = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = body.choices?.[0]?.message?.content;
  if (!content) throw new Error("Groq returned an empty response");

  return parseModelResponse(content, context);
}

function parseGroqError(status: number, detail: string): { kind: AdminAssistantResult["errorKind"]; message: string } {
  let apiMessage = "";
  try {
    const body = JSON.parse(detail) as { error?: { message?: string; type?: string; code?: string } };
    apiMessage = body.error?.message ?? "";

    if (status === 401 || apiMessage.toLowerCase().includes("invalid api key")) {
      return {
        kind: "auth",
        message:
          "**Invalid Groq API key** — check `GROQ_API_KEY` in `.env` (no quotes or spaces), restart the dev server, and try again.\n\nShowing offline fallback below.",
      };
    }
    if (status === 429) {
      return {
        kind: "rate_limit",
        message:
          "**Groq rate limit reached** — free tier caps requests per minute and per day. Wait a minute or check [console.groq.com/settings/limits](https://console.groq.com/settings/limits).\n\nShowing offline fallback below.",
      };
    }
    if (apiMessage) {
      return { kind: "unknown", message: `**Groq error:** ${apiMessage}\n\nShowing offline fallback below.` };
    }
  } catch {
    /* use status-based fallback */
  }

  if (status === 401) {
    return {
      kind: "auth",
      message:
        "**Invalid Groq API key** — check `GROQ_API_KEY` in `.env` and restart the dev server.\n\nShowing offline fallback below.",
    };
  }
  if (status === 429) {
    return {
      kind: "rate_limit",
      message:
        "**Groq rate limit reached** — wait a minute or switch to `llama-3.1-8b-instant` for higher free daily quota.\n\nShowing offline fallback below.",
    };
  }

  return {
    kind: "unknown",
    message: `**Groq request failed** (HTTP ${status}).\n\nShowing offline fallback below.`,
  };
}

function offlineFallback(
  messages: AdminAssistantInput["messages"],
  context: PlatformContext,
): AdminAssistantResult {
  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const lower = lastUser.toLowerCase();

  if (isCasualMessage(lastUser)) {
    return casualReply(context, lastUser);
  }

  const pendingCount = context.pendingIdeas.length;
  const openReports = context.openReports.length;
  const pendingApps = context.pendingApplications.length;

  if (
    lower.includes("team") ||
    lower.includes("recommend") ||
    lower.includes("student") ||
    lower.includes("robot") ||
    lower.includes("ai")
  ) {
    const teamRecommendations = recommendTeam(lastUser, context.students);
    const names = studentNameMap(context);
    const list = teamRecommendations
      .map((r) => `- **${names.get(r.studentId) ?? r.studentId}** — ${r.reason}`)
      .join("\n");

    return {
      reply: teamRecommendations.length
        ? `**Offline mode** — add \`GROQ_API_KEY\` for full AI assistance.\n\nKeyword-based team matches:\n${list}`
        : "**Offline mode** — no keyword matches found. Add `GROQ_API_KEY` for smarter recommendations.",
      teamRecommendations,
      suggestedFollowUps: ["Summarize platform priorities", "Draft a recruitment post"],
      source: "offline",
    };
  }

  if (lower.includes("priorit") || lower.includes("today") || lower.includes("summary")) {
    const stats = context.stats.map((s) => `- **${s.label}:** ${s.value} (${s.delta})`).join("\n");
    return {
      reply: `**Offline mode** — platform snapshot:\n\n${stats}\n\n**Needs attention:** ${pendingCount} ideas pending review, ${pendingApps} applications to process, ${openReports} open reports.\n\nAdd \`GROQ_API_KEY\` for detailed guidance.`,
      teamRecommendations: [],
      suggestedFollowUps: QUICK_OFFLINE_FOLLOWUPS,
      source: "offline",
    };
  }

  return {
    reply:
      "**Offline mode** — set `GROQ_API_KEY` in `.env` (server-only, no `VITE_` prefix) and restart the dev server.\n\nRecommended model: `llama-3.1-8b-instant` (best free tier quota).\n\nI can still do basic team matching — ask e.g. *\"Recommend students for a robotics project.\"*",
    teamRecommendations: [],
    suggestedFollowUps: QUICK_OFFLINE_FOLLOWUPS,
    source: "offline",
  };
}

const QUICK_OFFLINE_FOLLOWUPS = [
  "Recommend a team for a robotics project",
  "What should I prioritize today?",
];

export async function runAdminAssistant(input: AdminAssistantInput): Promise<AdminAssistantResult> {
  const { messages, context } = input;

  if (process.env.GROQ_API_KEY) {
    try {
      const result = await callGroq(messages, context);
      return { ...result, source: "groq" };
    } catch (error) {
      console.error("[admin-assistant] Groq error:", error);
      const fallback = offlineFallback(messages, context);
      const err = error as Error & { errorKind?: AdminAssistantResult["errorKind"] };
      const header =
        err.message && err.message.startsWith("**")
          ? `${err.message}\n\n`
          : "**Groq request failed.** Showing offline fallback below.\n\n";
      fallback.reply = `${header}${fallback.reply}`;
      fallback.errorKind = err.errorKind ?? "unknown";
      return fallback;
    }
  }

  return offlineFallback(messages, context);
}
