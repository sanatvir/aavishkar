import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

if (!isSupabaseConfigured) {
  console.warn(
    "[AAVISHKAR] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Add them to .env locally or Vercel → Settings → Environment Variables, then redeploy.",
  );
}

/** Placeholder values so SSR/build does not crash when env is unset; all DB calls must guard with isSupabaseConfigured. */
export const supabase = createClient(
  url || "https://placeholder.supabase.co",
  anonKey ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24ifQ.placeholder",
);
