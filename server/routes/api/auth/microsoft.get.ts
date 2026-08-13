import { defineHandler } from "nitro";
import {
  buildMicrosoftAuthorizeUrl,
  getAppOrigin,
  getMicrosoftAuthConfig,
} from "../../../lib/microsoft-auth.ts";

export default defineHandler((event) => {
  const config = getMicrosoftAuthConfig();
  if (!config.enabled) {
    return Response.json(
      { error: config.reason ?? "Microsoft sign-in is not configured on the server." },
      { status: 503 },
    );
  }

  const origin = getAppOrigin(event.req);
  const url = buildMicrosoftAuthorizeUrl(origin);
  return Response.redirect(url, 302);
});
