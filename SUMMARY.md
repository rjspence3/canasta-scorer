# Summary: Add invite share button and URL auto-fill to canasta scorer

## What was done
Added a "📱 Text invite" / "📋 Copy invite link" button to the Create Game code_display screen using the Web Share API with a clipboard fallback. Added `?join=XXXX` URL auto-fill on the Join Game screen so recipients go directly to the join form with the code pre-populated. Deployed to Vercel production.

## Key findings / Output
- Share button uses `navigator.share()` on mobile (opens native share sheet for iMessage, WhatsApp, etc.); falls back to clipboard copy with "Copied!" toast on desktop
- Share text: `"Join my canasta game! Use code XXXX or click: https://canasta-scorer.vercel.app?join=XXXX"`
- `?join=XXXX` URL param auto-fills join input, focuses it, and routes directly to the join form — recipient just taps "Join"
- URL param is cleaned with `replaceState` after reading to prevent re-trigger on refresh
- Build: 0 errors, 0 warnings. Deployed to https://canasta-scorer.vercel.app (commit 88b8f70)

## Actions needed
None — complete. Live at https://canasta-scorer.vercel.app
