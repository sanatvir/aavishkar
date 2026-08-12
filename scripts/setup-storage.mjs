/**
 * Creates avatars + project-files buckets via Supabase Storage API.
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env (Settings → API → service_role secret).
 * Never commit service_role or expose it in VITE_* vars.
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(root, ".env");

function loadEnv() {
  if (!existsSync(envPath)) return {};
  const out = {};
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    out[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return out;
}

const env = loadEnv();
const url = env.VITE_SUPABASE_URL ?? env.SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url) {
  console.error("Missing VITE_SUPABASE_URL in .env");
  process.exit(1);
}

if (!serviceKey) {
  console.error(`
Missing SUPABASE_SERVICE_ROLE_KEY in .env

1. Supabase Dashboard → Settings → API → service_role (secret) → Reveal
2. Add to .env (do NOT prefix with VITE_):
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

3. Re-run: node scripts/setup-storage.mjs

Or paste supabase/005_storage.sql into SQL Editor and Run.
`);
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const buckets = [
  {
    id: "avatars",
    public: true,
    fileSizeLimit: 524288,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  },
  {
    id: "project-files",
    public: true,
    fileSizeLimit: 26214400,
  },
];

for (const bucket of buckets) {
  const { data: existing } = await admin.storage.getBucket(bucket.id);
  if (existing) {
    const { error: updateError } = await admin.storage.updateBucket(bucket.id, {
      public: bucket.public,
      fileSizeLimit: bucket.fileSizeLimit,
      allowedMimeTypes: bucket.allowedMimeTypes,
    });
    if (updateError) {
      console.warn(`[${bucket.id}] update:`, updateError.message);
    } else {
      console.log(`Updated bucket: ${bucket.id}`);
    }
    continue;
  }

  const { error } = await admin.storage.createBucket(bucket.id, {
    public: bucket.public,
    fileSizeLimit: bucket.fileSizeLimit,
    allowedMimeTypes: bucket.allowedMimeTypes,
  });

  if (error) {
    console.error(`Failed to create ${bucket.id}:`, error.message);
    process.exit(1);
  }
  console.log(`Created bucket: ${bucket.id}`);
}

console.log(`
Buckets ready. Now run storage policies in SQL Editor:
  supabase/005_storage.sql

(Policies must be applied via SQL — the Storage API cannot create them.)
`);
