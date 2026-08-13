import { defineHandler } from "nitro";
import { getMicrosoftAuthConfig } from "../../../lib/microsoft-auth.ts";

export default defineHandler(() => {
  const config = getMicrosoftAuthConfig();
  return Response.json({
    enabled: config.enabled,
    reason: config.enabled ? undefined : config.reason,
  });
});
