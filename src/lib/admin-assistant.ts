import { createServerFn } from "@tanstack/react-start";
import {
  adminAssistantInputSchema,
  runAdminAssistant,
  type AdminAssistantResult,
} from "@/lib/admin-assistant.server";

export type { AdminAssistantResult };

export const chatWithAdminAssistant = createServerFn({ method: "POST" })
  .validator(adminAssistantInputSchema)
  .handler(async ({ data }): Promise<AdminAssistantResult> => runAdminAssistant(data));
