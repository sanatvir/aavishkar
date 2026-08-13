import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AavishkarLogo } from "@/components/brand/AavishkarLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { verifyCoordinatorSignIn } from "@/lib/auth";
import { setCoordinatorSession } from "@/lib/session";

export const Route = createFileRoute("/login/admin")({
  head: () => ({
    meta: [
      { title: "Coordinator login — AAVISHKAR" },
      { name: "description", content: "ATL coordinator portal for Army Public School Dhaula Kuan." },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const signIn = async () => {
    if (!code.trim()) {
      toast.error("Enter the coordinator sign-in code.");
      return;
    }

    setSubmitting(true);
    try {
      const ok = await verifyCoordinatorSignIn(code);
      if (!ok) {
        toast.error("Invalid coordinator code.");
        return;
      }
      setCoordinatorSession();
      toast.success("Welcome to the coordinator portal.");
      navigate({ to: "/admin" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="hero-mesh min-h-screen px-6 py-10">
      <div className="mx-auto max-w-md">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <AavishkarLogo size="md" />
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight">Coordinator login</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter the ATL portal code shared with APS Dhaula Kuan coordinators.
        </p>

        <div className="surface mt-8 space-y-5 p-6">
          <div className="space-y-1.5">
            <Label htmlFor="code">Coordinator code</Label>
            <Input
              id="code"
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="ATL portal code"
              autoComplete="off"
              onKeyDown={(e) => e.key === "Enter" && void signIn()}
            />
          </div>

          <Button className="h-11 w-full gap-2" disabled={submitting} onClick={() => void signIn()}>
            <ShieldCheck className="h-4 w-4" />
            Open coordinator portal
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Change this code anytime in Admin → Settings → Platform.
          </p>
        </div>
      </div>
    </div>
  );
}
