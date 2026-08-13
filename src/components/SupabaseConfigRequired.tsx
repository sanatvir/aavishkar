import { Database } from "lucide-react";
import { INSTITUTION_NAME, PLATFORM_NAME } from "@/lib/brand";

export function SupabaseConfigRequired() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-destructive/10 text-destructive">
        <Database className="h-7 w-7" />
      </div>
      <div className="max-w-lg space-y-3">
        <h1 className="text-xl font-semibold">{PLATFORM_NAME} needs Supabase</h1>
        <p className="text-sm text-muted-foreground">
          Production uses live database data only — no mock students or projects. Add{" "}
          <strong>both</strong> variables below (URL alone is not enough; you need the anon key too).
        </p>
        <div className="rounded-xl border border-border bg-card/60 p-4 text-left text-xs text-muted-foreground">
          <p className="font-medium text-foreground">Local — create <code>.env</code> in the project root:</p>
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-all font-mono text-[0.7rem] text-foreground/90">{`VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...your-anon-key`}</pre>
          <p className="mt-3 font-medium text-foreground">Vercel — Settings → Environment Variables:</p>
          <p className="mt-1">Same two names for Production and Preview, then redeploy.</p>
          <p className="mt-3">
            Find both in Supabase → Project Settings → API → Project URL and{" "}
            <code className="text-foreground">anon</code> <code className="text-foreground">public</code> key.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">{INSTITUTION_NAME} · ATL Launchpad</p>
      </div>
    </div>
  );
}
