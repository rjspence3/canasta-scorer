# Canasta Scorer

Mobile-friendly canasta scoring app for Classic Partnership Canasta. Built with Next.js 14, shadcn/ui, and Tailwind CSS. No backend required — state persists in `localStorage`.

## Features

- Track scores for two teams across multiple hands
- Auto-calculates: melded points, canasta bonuses (500/300), red 3 bonuses/penalties, going out bonus
- Initial meld requirement reminder per team (15/50/90/120 thresholds)
- Undo last hand
- Score history with per-hand breakdown
- Offline-capable — no network needed at the card table
- Mobile-first UI with large tap targets

## Card Point Values

| Card | Value |
|------|-------|
| Joker | 50 |
| 2, Ace | 20 |
| K, Q, J, 10, 9, 8 | 10 |
| 7, 6, 5, 4, Black 3 | 5 |

## Deploy to Vercel

### One-click deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/rjspence3/canasta-scorer)

### Manual deploy

```bash
# Install dependencies
npm install

# Run locally
npm run dev

# Deploy to Vercel
npx vercel --prod
```

### Requirements

- Node.js 18+
- No environment variables needed

## Development

```bash
npm install
npm run dev
# Open http://localhost:3000
```

## Scoring Rules Summary

- **Natural canasta** (7 naturals): +500 pts bonus
- **Mixed canasta** (with wilds): +300 pts bonus
- **Red 3s**: 100/200/300/800 pts (doubled if all 4); negative if team has no melds
- **Going out**: +100 pts normal, +200 pts concealed
- **Unmelded cards**: subtract full point value
- **Game end**: first team to reach 5,000 pts (at end of a hand)
