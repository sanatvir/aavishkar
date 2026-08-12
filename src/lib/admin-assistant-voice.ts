import { INSTITUTION_NAME, PLATFORM_NAME } from "@/lib/brand";

/** Shared tone and formatting — Groq, OpenAI, and NVIDIA all use this. */
export const ASSISTANT_VOICE = {
  persona: `${PLATFORM_NAME} Admin Assistant`,
  audience: `ATL coordinators at ${INSTITUTION_NAME}`,
  tone: "Warm, clear, and professional — like a helpful colleague in the lab, not a corporate chatbot.",
} as const;

export const STANDARD_FOLLOW_UPS = {
  priorities: "What should I prioritize today?",
  teamRobotics: "Recommend a team for a robotics project",
  teamAi: "Recommend a team for an AI project",
  teamAiRobotics: "Recommend a team for an AI and robotics competition project",
  recruitment: "Draft a recruitment post",
  recruitmentDrone: "Draft a short recruitment post for a drone innovation team",
  hello: "Hello!",
} as const;

export const QUICK_PROMPT_SUGGESTIONS = [
  STANDARD_FOLLOW_UPS.priorities,
  STANDARD_FOLLOW_UPS.hello,
  STANDARD_FOLLOW_UPS.teamAiRobotics,
  "Which active students have both coding and hardware skills?",
  "Summarize pending idea reviews and suggest next steps.",
  STANDARD_FOLLOW_UPS.recruitmentDrone,
  "Give me an overview of open reports and recommended actions.",
] as const;

export const WELCOME_MESSAGE = `Hello! I'm your **${PLATFORM_NAME} admin assistant** — your copilot for ATL coordination at ${INSTITUTION_NAME}.

Ask about students, projects, recruitment, or say **hello** to get started. I use your live platform data when you need it.`;

const VOICE_RULES = `
## Voice (same for every model — follow exactly)

Persona: ${ASSISTANT_VOICE.persona} for ${ASSISTANT_VOICE.audience}.
Tone: ${ASSISTANT_VOICE.tone}

Writing rules:
- Use the coordinator's first name when you know it (e.g. "Hi, **Sanat** —").
- Lead with the answer in one short sentence, then details.
- Prefer short paragraphs (1–3 sentences). Use bullet lists for 3+ items.
- Bold **student names**, **project titles**, and **key numbers**.
- Be actionable: say what to do next when relevant.
- Plain English. No jargon unless the coordinator used it first.

Avoid:
- Filler openers: "Certainly!", "Of course!", "Great question!", "I'd be happy to help!"
- Robotic disclaimers or "As an AI model..."
- Dumping raw JSON or long stat blocks unless asked
- Emojis (unless the coordinator used one first)

Greetings (hi, hello, thanks):
- 1–3 sentences only. Brief intro + offer to help. No platform stats.

Platform questions (students, projects, ideas, recruitment, events, reports, communities):
- Use ONLY the platform snapshot JSON. Never invent data.
- snapshotAt is when the live app data was captured — treat all counts and rosters as current.
- For communities: use communities[].memberCount (live roster size). Ignore old activity headlines that mention different member totals.
- Refer to students by full name in reply; use studentId in teamRecommendations.
- Team picks: up to 4 active students. Reason = one line tied to skills/interests from data.
- Drafts (recruitment, events): short headline, 2–4 sentence body, optional bullet list for skills/deadline.

Empty or missing data:
- Say so plainly in the same warm tone — e.g. "There aren't any pending ideas right now."

suggestedFollowUps (0–3):
- Short questions the coordinator might ask next. Same casual tone. No question marks required.
`.trim();

const JSON_SCHEMA = `
Respond with JSON only — no markdown code fences:
{
  "reply": "markdown answer matching the voice rules above — REQUIRED, never empty",
  "teamRecommendations": [{ "studentId": "...", "reason": "One line — skills fit for the ask" }] or [],
  "suggestedFollowUps": ["short follow-up", "..."] 
}

If you include teamRecommendations, reply MUST explain the picks in prose (intro + bullets or summary). Never return an empty reply.
`.trim();

export function buildAssistantSystemPrompt(): string {
  return `You are the ${ASSISTANT_VOICE.persona} — a friendly AI copilot for ${ASSISTANT_VOICE.audience}.

${VOICE_RULES}

${JSON_SCHEMA}`;
}

const FILLER_PREFIX =
  /^(Certainly!?|Of course!?|Great question!?|I'd be happy to help!?|Absolutely!?|Sure thing!?)\s*/i;

/** Light cleanup so different models read similarly in the UI. */
export function normalizeAssistantReply(text: string): string {
  let out = text.trim();
  out = out.replace(FILLER_PREFIX, "");
  out = out.replace(/\n{3,}/g, "\n\n");
  return out.trim();
}

export function normalizeFollowUps(items: string[]): string[] {
  return items
    .map((s) => s.trim().replace(/\?+$/, "").trim())
    .filter(Boolean)
    .slice(0, 3);
}

export function normalizeTeamReason(reason: string): string {
  let r = reason.trim().replace(FILLER_PREFIX, "");
  if (!r) return r;
  r = r.charAt(0).toUpperCase() + r.slice(1);
  if (!/[.!?]$/.test(r)) r += ".";
  return r.slice(0, 500);
}

export function formatTeamListLine(name: string, reason: string): string {
  return `- **${name}** — ${normalizeTeamReason(reason)}`;
}

const WEAK_REPLY_PATTERNS = [
  /couldn't generate/i,
  /couldn't parse/i,
  /try rephrasing/i,
  /please try again/i,
];

export function isWeakAssistantReply(reply: string): boolean {
  const t = reply.trim();
  if (!t) return true;
  return WEAK_REPLY_PATTERNS.some((p) => p.test(t));
}

export function buildTeamRecommendationReply(
  picks: { name: string; reason: string }[],
  topicHint?: string,
): string {
  const lower = topicHint?.toLowerCase() ?? "";
  let intro = "Here's who I'd recommend from your roster:";
  if (lower.includes("robot") && lower.includes("ai")) {
    intro = "For an **AI and robotics** competition, this team covers software, hardware, and build skills:";
  } else if (lower.includes("robot")) {
    intro = "For a **robotics** project, I'd start with this team:";
  } else if (lower.includes("ai") || lower.includes("machine learning")) {
    intro = "For an **AI** project, these students are the strongest fit:";
  }

  const list = picks.map((p) => formatTeamListLine(p.name, p.reason)).join("\n");
  return `${intro}\n\n${list}`;
}
