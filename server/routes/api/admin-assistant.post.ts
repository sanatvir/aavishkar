import { defineHandler } from "nitro";
import {
  adminAssistantInputSchema,
  runAdminAssistant,
} from "../../../src/lib/admin-assistant.server.ts";
import { ASSISTANT_SERVER_UNAVAILABLE, sanitizePlatformContext } from "../../../src/lib/admin-assistant-context.ts";
import type { PlatformContext } from "../../../src/lib/admin-assistant-context.ts";

export default defineHandler(async (event) => {
  if (event.req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const body = (await event.req.json()) as {
      messages?: unknown;
      context?: unknown;
    };

    const parsed = adminAssistantInputSchema.safeParse({
      messages: Array.isArray(body?.messages) ? body.messages.slice(-24) : [],
      context: sanitizePlatformContext((body?.context ?? {}) as PlatformContext),
    });

    if (!parsed.success) {
      console.error("[api/admin-assistant] validation failed:", parsed.error.flatten());
      return Response.json(
        {
          reply: ASSISTANT_SERVER_UNAVAILABLE,
          teamRecommendations: [],
          suggestedFollowUps: [],
          errorKind: "network",
        },
        { status: 400 },
      );
    }

    return await runAdminAssistant(parsed.data);
  } catch (error) {
    console.error("[api/admin-assistant] handler error:", error);
    return {
      reply: ASSISTANT_SERVER_UNAVAILABLE,
      teamRecommendations: [],
      suggestedFollowUps: [],
      errorKind: "network",
    };
  }
});
