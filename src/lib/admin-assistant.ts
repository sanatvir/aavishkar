import type { AdminAssistantResult, PlatformContext } from "@/lib/admin-assistant-context";
import { ASSISTANT_SERVER_UNAVAILABLE } from "@/lib/admin-assistant-context";

export type { AdminAssistantResult };

type ChatInput = {
  messages: { role: "user" | "assistant"; content: string }[];
  context: PlatformContext;
};

export async function chatWithAdminAssistant(input: {
  data: ChatInput;
}): Promise<AdminAssistantResult> {
  const response = await fetch("/api/admin-assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input.data),
  });

  const body = (await response.json().catch(() => null)) as AdminAssistantResult | null;

  if (!body || typeof body.reply !== "string") {
    throw new Error(`Assistant API failed (${response.status})`);
  }

  if (!response.ok && !body.errorKind) {
    return {
      ...body,
      errorKind: "network",
    };
  }

  return body;
}

export async function chatWithAdminAssistantSafe(input: {
  data: ChatInput;
}): Promise<AdminAssistantResult> {
  try {
    return await chatWithAdminAssistant(input);
  } catch (error) {
    console.error("[AdminAssistantChat] request failed:", error);
    return {
      reply: ASSISTANT_SERVER_UNAVAILABLE,
      teamRecommendations: [],
      suggestedFollowUps: [],
      errorKind: "network",
    };
  }
}
