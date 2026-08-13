import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AavishkarLogo } from "@/components/brand/AavishkarLogo";
import { verifyAuthSessionToken } from "@/lib/microsoft-auth";
import { setStudentSession } from "@/lib/session";

export const Route = createFileRoute("/auth/callback")({
  head: () => ({
    meta: [{ title: "Signing in — AAVISHKAR" }],
  }),
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Completing Microsoft sign-in…");

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const params = new URLSearchParams(window.location.search);
      const error = params.get("error");
      const token = params.get("token");

      if (error) {
        if (!cancelled) {
          setMessage(error);
          toast.error(error);
          navigate({ to: "/", replace: true });
        }
        return;
      }

      if (!token) {
        if (!cancelled) {
          setMessage("Missing sign-in token.");
          toast.error("Microsoft sign-in did not complete.");
          navigate({ to: "/", replace: true });
        }
        return;
      }

      const session = await verifyAuthSessionToken(token);
      if (cancelled) return;

      if (!session) {
        setMessage("Your sign-in link expired. Please try again.");
        toast.error("Sign-in session expired. Use Continue with Microsoft again.");
        navigate({ to: "/", replace: true });
        return;
      }

      setStudentSession(session.studentId);
      toast.success("Signed in with Microsoft.");
      navigate({ to: "/app", replace: true });
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div className="hero-mesh flex min-h-screen items-center justify-center px-6">
      <div className="surface max-w-md p-8 text-center">
        <AavishkarLogo size="md" className="mx-auto" />
        <p className="mt-6 text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
