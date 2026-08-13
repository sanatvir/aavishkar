import { defineHandler } from "nitro";
import { verifySessionToken } from "../../../lib/microsoft-auth.ts";

export default defineHandler(async (event) => {
  if (event.req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  let token: string | undefined;
  try {
    const body = (await event.req.json()) as { token?: string };
    token = body.token?.trim();
  } catch {
    return Response.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  if (!token) {
    return Response.json({ ok: false, error: "Missing session token." }, { status: 400 });
  }

  const session = verifySessionToken(token);
  if (!session) {
    return Response.json({ ok: false, error: "Session expired or invalid." }, { status: 401 });
  }

  return Response.json({
    ok: true,
    studentId: session.studentId,
    email: session.email,
  });
});
