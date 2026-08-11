import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.warn(
    "[AAVISHKAR] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Add them to .env in the project root (next to package.json).",
  );
}

export const supabase = createClient(url ?? "", anonKey ?? "");

export const isSupabaseConfigured = Boolean(url && anonKey);
