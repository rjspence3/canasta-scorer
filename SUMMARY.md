# Summary: Configurable house rules for Canasta Scorer

## What was done
Added a full house rules system to the canasta scorer. During game creation, hosts can expand a collapsible "⚙️ House Rules" section to configure 13 scoring variants. Rules are stored in game state (local and Supabase), applied to all scoring calculations, and visible via a "📋 Rules" button in the game header during play.

## Key findings / Output
- **New files:** `lib/houseRules.ts` (interface + defaults + options), `components/HouseRulesSetup.tsx` (setup UI), `components/RulesModal.tsx` (in-game viewer)
- **Updated:** `lib/scoring.ts` accepts `HouseRules` param; `GameState` and `MultiplayerGameState` store house rules; `HandScoringForm` labels reflect active rules; `ScoreBoard` passes rules to `getMinimumMeld` and shows Rules modal
- **Backward compat:** `storage.ts` backfills `houseRules` on saves from before this feature
- **Live at:** https://canasta-scorer.vercel.app (commit `ee0d0b4`, deployed `dpl_AyrNSE7stBradcjTkaeWqGonctEG`)

## Actions needed
None — complete.
