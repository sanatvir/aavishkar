import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Lightbulb, ShieldCheck, Sparkles, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AavishkarLogo } from "@/components/brand/AavishkarLogo";
import { LoginVisual } from "@/components/brand/LoginVisual";
import { Button } from "@/components/ui/button";
import { signInWithMicrosoft } from "@/lib/microsoft-auth";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { loadPublicStats } from "@/lib/supabase/store";
import { setCoordinatorSession } from "@/lib/session";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AAVISHKAR — Where APSDK builds what's next" },
      {
        name: "description",
        content:
          "A school-wide platform for APS Dhaula Kuan students to discover talent, exchange ideas, build teams and create meaningful projects.",
      },
      { property: "og:title", content: "AAVISHKAR — Where APSDK builds what's next" },
      {
        property: "og:description",
        content: "The ATL • APSDK innovation and talent platform for students.",
      },
    ],
  }),
  component: Landing,
});

const MicrosoftGlyph = () => (
  <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
    <rect x="1" y="1" width="8" height="8" fill="#F25022" />
    <rect x="11" y="1" width="8" height="8" fill="#7FBA00" />
    <rect x="1" y="11" width="8" height="8" fill="#00A4EF" />
    <rect x="11" y="11" width="8" height="8" fill="#FFB900" />
  </svg>
);

function Landing() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ students: 0, ideas: 0, projects: 0 });
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    loadPublicStats().then((s) => {
      if (s) setStats(s);
    });
  }, []);

  const studentLabel =
    stats.students > 0 ? `${stats.students} students` : "Students across APSDK";
  const projectLabel =
    stats.projects > 0 ? `${stats.projects} ATL projects` : "ATL projects";

  const continueWithMicrosoft = async () => {
    setSigningIn(true);
    try {
      const result = await signInWithMicrosoft();
      if (result === "demo") {
        navigate({ to: "/app" });
      }
    } catch {
      toast.error("Microsoft sign-in failed. Try again or contact your ATL coordinator.");
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div className="hero-mesh min-h-screen">
      <div className="mx-auto grid min-h-screen max-w-7xl items-center gap-14 px-6 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:px-10">
        <div className="page-enter">
          <AavishkarLogo size="lg" />

          <h1 className="mt-7 max-w-xl text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.25rem]">
            Where APSDK builds <span className="text-gradient-brand">what's next.</span>
          </h1>

          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
            A school-wide platform for students to discover talent, exchange ideas, build teams and
            create meaningful projects.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              size="lg"
              className="h-13 gap-3 px-6 text-base"
              disabled={signingIn}
              onClick={() => void continueWithMicrosoft()}
            >
              <MicrosoftGlyph />
              Continue with Microsoft
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-13 gap-3 px-6 text-base"
              onClick={() => {
                setCoordinatorSession();
                navigate({ to: "/admin" });
              }}
            >
              <ShieldCheck className="h-4 w-4" />
              Admin login
            </Button>
          </div>

          <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" />
            Exclusively for APS Dhaula Kuan · @apsdk.edu.in accounts
          </p>

          <div className="mt-14 grid gap-4 sm:grid-cols-3">
            {[
              { icon: Users, label: studentLabel, meta: "Live on AAVISHKAR" },
              { icon: Lightbulb, label: "Idea Hub", meta: stats.ideas > 0 ? `${stats.ideas} ideas live` : "Share, support, build" },
              { icon: Sparkles, label: projectLabel, meta: "Teams that ship" },
            ].map((f) => (
              <div key={f.label} className="surface p-4">
                <f.icon className="h-4.5 w-4.5 text-accent" />
                <p className="mt-3 text-sm font-semibold">{f.label}</p>
                <p className="text-xs text-muted-foreground">{f.meta}</p>
              </div>
            ))}
          </div>

          <p className="mt-10 text-xs text-muted-foreground">
            An Army Public School Dhaula Kuan Initiative · Aavishkar means invention, discovery and
            innovation.
          </p>
        </div>

        <div className="relative hidden lg:block">
          <div className="surface lift overflow-hidden p-0">
            <div className="hero-mesh h-[560px]">
              <LoginVisual />
            </div>
          </div>
          <div className="surface absolute bottom-6 left-6 right-6 flex items-center gap-4 p-4 backdrop-blur">
            <div className="text-sm">
              <p className="font-semibold">Discover → Collaborate → Build → Showcase</p>
              <p className="text-xs text-muted-foreground">
                The full student innovation journey, in one place.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
