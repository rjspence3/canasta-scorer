# Summary: Real-time multiplayer added to canasta scorer via Supabase

## What was done
Added full two-player multiplayer to the canasta scorer using Supabase Realtime. A new mode picker screen lets players choose "Single Device" (existing flow, unchanged) or "Multiplayer" (new). In multiplayer, one phone creates a room (gets a 4-letter code), the other joins — both pick their team, then each phone sees only their own hand-entry form. Supabase Realtime syncs state in real-time. Win celebration fires on both phones simultaneously.

## Key findings / Output
- `src/lib/supabase.ts` — Supabase client (graceful null when env vars absent)
- `src/lib/multiplayerTypes.ts` — Multiplayer game state types
- `src/components/MultiplayerGame.tsx` — Full lobby + playing flow (lobby, create, join, team select, playing, gameover)
- `src/app/page.tsx` — Mode picker added; single-device flow 100% intact
- `output/SUPABASE_SETUP.md` — Exact SQL to run + env var instructions
- Build: `npm run build` passes with 0 errors, lint: 0 warnings

## Actions needed
**Rob must set up Supabase manually** (worker can't create Supabase projects via CLI without credentials):
1. Create project at supabase.com
2. Run the SQL in `output/SUPABASE_SETUP.md`
3. Add `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` to Vercel env
4. Redeploy — multiplayer will activate automatically
