# Supabase Setup for Canasta Multiplayer

## Step 1 — Create a Supabase project

1. Go to https://supabase.com and sign in
2. Click **New Project** → pick an org → name it `canasta-scorer`
3. Choose a region close to you (e.g. `us-east-1`)
4. Set a database password (save it) → click **Create new project**
5. Wait ~2 minutes for provisioning

## Step 2 — Run the schema SQL

In your Supabase project, go to **SQL Editor** → **New Query** and run:

```sql
-- Create the games table
CREATE TABLE canasta_games (
  room_code   text        PRIMARY KEY,
  state       jsonb       NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Row Level Security (allow public anonymous access — room codes provide security)
ALTER TABLE canasta_games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_access" ON canasta_games
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Enable Realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE canasta_games;
```

Click **Run**.

## Step 3 — Get your environment variables

In your Supabase project:
1. Go to **Settings → API**
2. Copy:
   - **Project URL** → this is `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public key** → this is `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Step 4 — Set env vars in Vercel

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Paste the values when prompted
# Also add for preview + development if needed
```

Or in the Vercel dashboard: **Project → Settings → Environment Variables**.

## Step 5 — Local development

Create `.env.local` in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

(This file is gitignored.)

## Step 6 — Optional: Auto-expire old rooms

Add a Supabase scheduled cleanup (via pg_cron or Edge Function) to delete rooms older than 24h.
The app already checks `created_at` client-side and refuses to join expired rooms, so this is housekeeping only.

```sql
-- Run in SQL editor to enable pg_cron (if available on your plan)
SELECT cron.schedule(
  'delete-old-rooms',
  '0 * * * *',  -- every hour
  $$DELETE FROM canasta_games WHERE created_at < now() - interval '24 hours'$$
);
```

## How it works

- **Room codes** are 4 uppercase letters (e.g. `QRSV`), generated client-side
- **Game state** is stored as a single JSONB column — the full game state object
- **Realtime** uses Supabase's Postgres changes subscription; both phones subscribe to `UPDATE` events on their room's row
- **Race-condition safety**: when submitting a hand, each client fetches the latest state before writing, to avoid overwriting the other team's entry
- **Fallback**: if `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` are not set, the app shows a helpful "not configured" screen and multiplayer is disabled — single-device mode continues to work normally
