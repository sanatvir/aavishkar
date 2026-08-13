import { defineHandler } from "nitro";
import {
  completeMicrosoftLogin,
  getAppOrigin,
  getMicrosoftAuthConfig,
} from "../../../../lib/microsoft-auth.ts";

export default defineHandler(async (event) => {
  const config = getMicrosoftAuthConfig();
  const origin = getAppOrigin(event.req);
  const fail = (message: string) =>
    Response.redirect(`${origin}/auth/callback?error=${encodeURIComponent(message)}`, 302);

  if (!config.enabled) {
    return fail(config.reason ?? "Microsoft sign-in is not configured.");
  }

  const url = new URL(event.req.url);
  const error = url.searchParams.get("error_description") ?? url.searchParams.get("error");
  if (error) return fail(error);

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) return fail("Microsoft did not return a sign-in code.");

  const result = await completeMicrosoftLogin(code, state, origin);
  if (!result.ok) return fail(result.error);

  return Response.redirect(`${origin}/auth/callback?token=${encodeURIComponent(result.sessionToken)}`, 302);
});
