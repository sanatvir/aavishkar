# Supabase setup — AAVISHKAR

## 1. `.env` location

Put `.env` **inside this folder** (next to `package.json`):

```
aavishkar-launchpad-main/
├── package.json
├── .env              ← here
└── .env.example      ← template only (safe to commit)
```

Copy from `.env.example` and fill in values from Supabase → **Settings → API**.

## 2. Create tables

1. Open [supabase.com](https://supabase.com) → your project
2. **SQL Editor** → **New query**
3. Paste all of `supabase/schema.sql`
4. Click **Run**

You should see tables under **Table Editor**.

## 2b. Live data tables (required for admin dashboard, events, settings)

If you already ran `schema.sql` before, run **`supabase/002_live_data.sql`** the same way (SQL Editor → paste → Run).

New installs: run `schema.sql` then `002_live_data.sql`.

## 2c. Feature tables (recruitment registration, idea moderation)

Run **`supabase/003_features.sql`** after the steps above.

## 2d. Profile picture columns

Run **`supabase/004_avatars.sql`**.

## 2e. Storage (avatars + project files)

Run **`supabase/005_storage.sql`** in SQL Editor (creates buckets + upload/read policies in one go).

Optional: create buckets via CLI instead (policies still need the SQL file):

```powershell
# Add SUPABASE_SERVICE_ROLE_KEY to .env (never VITE_ — server secret only)
node scripts/setup-storage.mjs
# Then still run supabase/005_storage.sql for policies (or run the full file once in SQL Editor)
```

Verify in **Storage**: buckets `avatars` and `project-files` appear. Test profile upload in **Settings → Profile**.

## 3. Seed data

Demo seeding is **off by default**. For local demos with the 10 sample students, add to `.env`:

```
VITE_ENABLE_DEMO_SEED=true
```

Then on first app load with empty tables, the app seeds from `mock-data.ts`.

**Production:** leave this unset. Import real student data via Supabase or your roster pipeline.

## 4. Install & run app

```powershell
npm install
npm run dev
```

## 5. Deploy (Vercel)

1. Push the repo to GitHub and import it in [Vercel](https://vercel.com).
2. **Root directory:** if the repo has a nested folder, set it to `aavishkar-launchpad-main` (or wherever `package.json` lives).
3. **Environment variables** (Project → Settings → Environment Variables). Add for **Production**, **Preview**, and **Development**:

   | Name | Value |
   |------|--------|
   | `VITE_SUPABASE_URL` | From Supabase → Settings → API → Project URL |
   | `VITE_SUPABASE_ANON_KEY` | From Supabase → Settings → API → anon public key |
   | `GROQ_API_KEY` | From [console.groq.com/keys](https://console.groq.com/keys) — powers **Admin → AI Assistant** (server-only) |
   | `GROQ_MODEL` | Optional — default `llama-3.1-8b-instant` (best free quota). Use `llama-3.3-70b-versatile` for smarter drafts |

4. **Redeploy** after adding variables (`VITE_*` vars are baked in at build time — a redeploy is required). `GROQ_API_KEY` is read at runtime on the server.
5. Optional local demo seed only: `VITE_ENABLE_DEMO_SEED=true` (do **not** use in production).

If env vars are missing, the site loads in offline demo mode instead of crashing with a 500.

## 5b. Microsoft student sign-in

Add these **server-only** env vars (`.env` locally, Vercel → Environment Variables). Restart / redeploy after changes.

| Name | Value |
|------|--------|
| `AZURE_CLIENT_ID` | Azure App registration → Application (client) ID |
| `AZURE_CLIENT_SECRET` | Certificates & secrets → new client secret value |
| `AZURE_TENANT_ID` | Azure → Directory (tenant) ID |
| `AUTH_SECRET` | Long random string (signs login sessions) |
| `APP_URL` | `https://your-app.vercel.app` (or `http://localhost:3000` locally) |
| `SUPABASE_SERVICE_ROLE_KEY` | Recommended — Supabase → Settings → API → service_role |

**Azure redirect URIs** (Authentication → Web):

- `http://localhost:3000/api/auth/microsoft/callback`
- `https://YOUR-DOMAIN/api/auth/microsoft/callback`

Student Microsoft emails must match roster ids (e.g. `sanatvir@apsdk.edu.in` → student `sanatvir` in the `students` table).

## 6. Local production preview

```powershell
cd path\to\aavishkar-launchpad-main
npm install
# ensure .env exists with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run build
npm run preview
```

Open the URL shown in the terminal (usually `http://localhost:4173`).
