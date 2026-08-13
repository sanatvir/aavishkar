import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AavishkarLogo } from "@/components/brand/AavishkarLogo";
import { Button } from "@/components/ui/button";
import { setStudentSession } from "@/lib/session";

export const Route = createFileRoute("/auth/callback")({
  head: () => ({
    meta: [{ title: "Signing in — AAVISHKAR" }],
  }),
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const err = params.get("error");

    if (err) {
      setError(decodeURIComponent(err));
      return;
    }

    if (!token) {
      setError("Missing sign-in token. Please try again from the landing page.");
      return;
    }

    (async () => {
      try {
        const res = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = (await res.json()) as { ok?: boolean; studentId?: string; error?: string };
        if (!res.ok || !data.ok || !data.studentId) {
          setError(data.error ?? "Sign-in failed. Please try again.");
          return;
        }
        setStudentSession(data.studentId);
        navigate({ to: "/app", replace: true });
      } catch {
        setError("Could not complete sign-in. Check your connection and try again.");
      }
    })();
  }, [navigate]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <AavishkarLogo size="sm" />
        <div className="max-w-md space-y-3">
          <h1 className="text-xl font-semibold">Sign-in failed</h1>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button asChild>
            <Link to="/">Back to home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
      Signing you in…
    </div>
  );
}
