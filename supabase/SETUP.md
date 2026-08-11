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

Add the same two env vars in Vercel → Project → Settings → Environment Variables.
