import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AavishkarLogo } from "@/components/brand/AavishkarLogo";
import { Avatar } from "@/components/ui-kit/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loadSignInPolicy, loadSignInStudents, verifyStudentSignIn, type SignInStudent } from "@/lib/auth";
import { setStudentSession } from "@/lib/session";

export const Route = createFileRoute("/login/student")({
  head: () => ({
    meta: [
      { title: "Student sign-in — AAVISHKAR" },
      { name: "description", content: "Sign in to the APS Dhaula Kuan student innovation portal." },
    ],
  }),
  component: StudentLogin,
});

function StudentLogin() {
  const navigate = useNavigate();
  const [roster, setRoster] = useState<SignInStudent[]>([]);
  const [restrictSignin, setRestrictSignin] = useState(true);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([loadSignInStudents(), loadSignInPolicy()])
      .then(([students, policy]) => {
        setRoster(students);
        setRestrictSignin(policy.restrictSignin);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return roster;
    return roster.filter(
      (s) => s.name.toLowerCase().includes(q) || s.className.toLowerCase().includes(q) || s.id.includes(q),
    );
  }, [query, roster]);

  const selected = roster.find((s) => s.id === selectedId);

  const signIn = async () => {
    if (!selectedId) {
      toast.error("Choose your name from the roster first.");
      return;
    }
    if (restrictSignin && !code.trim()) {
      toast.error("Enter the sign-in code from your ATL coordinator.");
      return;
    }

    setSubmitting(true);
    try {
      const ok = await verifyStudentSignIn(selectedId, code);
      if (!ok) {
        toast.error("Sign-in failed. Check your code or ask your coordinator.");
        return;
      }
      setStudentSession(selectedId);
      toast.success(`Welcome back${selected ? `, ${selected.name.split(" ")[0]}` : ""}!`);
      navigate({ to: "/app" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="hero-mesh min-h-screen px-6 py-10">
      <div className="mx-auto max-w-lg">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <AavishkarLogo size="md" />
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight">Student sign-in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Select your profile from the APSDK roster
          {restrictSignin ? " and enter your personal sign-in code." : "."}
        </p>

        <div className="surface mt-8 space-y-5 p-6">
          <div className="space-y-1.5">
            <Label htmlFor="search">Find your name</Label>
            <Input
              id="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or class..."
              autoComplete="off"
            />
          </div>

          <div className="max-h-64 space-y-2 overflow-y-auto rounded-xl border border-border p-2">
            {loading ? (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">Loading roster…</p>
            ) : filtered.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                No active students found. Ask your coordinator to add you to AAVISHKAR.
              </p>
            ) : (
              filtered.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedId(s.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                    selectedId === s.id ? "bg-accent/15 ring-1 ring-accent/40" : "hover:bg-secondary/70"
                  }`}
                >
                  <Avatar initials={s.initials} accent={s.accent} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{s.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{s.className}</p>
                  </div>
                </button>
              ))
            )}
          </div>

          {restrictSignin && (
            <div className="space-y-1.5">
              <Label htmlFor="code">Sign-in code</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="From your ATL coordinator"
                autoComplete="off"
                onKeyDown={(e) => e.key === "Enter" && void signIn()}
              />
            </div>
          )}

          <Button className="h-11 w-full gap-2" disabled={submitting || !selectedId} onClick={() => void signIn()}>
            Continue to AAVISHKAR
            <ArrowRight className="h-4 w-4" />
          </Button>

          <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" />
            Exclusively for APS Dhaula Kuan students
          </p>
        </div>
      </div>
    </div>
  );
}
