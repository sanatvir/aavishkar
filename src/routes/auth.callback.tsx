import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AavishkarLogo } from "@/components/brand/AavishkarLogo";
import { completeMicrosoftAuthCallback } from "@/lib/microsoft-auth";
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
      const studentId = await completeMicrosoftAuthCallback();
      if (cancelled) return;

      if (!studentId) {
        setMessage("We couldn't match your school account to a student profile.");
        toast.error("No AAVISHKAR student profile found for this Microsoft account.");
        navigate({ to: "/", replace: true });
        return;
      }

      setStudentSession(studentId);
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
