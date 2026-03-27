import { HandEntry } from "./types";

const RED_THREE_BONUS: Record<number, number> = {
  0: 0,
  1: 100,
  2: 200,
  3: 300,
  4: 800,
};

export function calculateHandScore(entry: HandEntry): number {
  let score = entry.meldedPoints;
  score += entry.naturalCanastas * 500;
  score += entry.mixedCanastas * 300;

  const redThreeValue = RED_THREE_BONUS[entry.redThrees] ?? 0;
  if (entry.hasNoMelds && entry.redThrees > 0) {
    score -= redThreeValue;
  } else {
    score += redThreeValue;
  }

  if (entry.goingOut === "normal") score += 100;
  if (entry.goingOut === "concealed") score += 200;

  score -= entry.unmeledPoints;

  return score;
}

export function getMinimumMeld(cumulativeScore: number): number {
  if (cumulativeScore < 0) return 15;
  if (cumulativeScore < 1500) return 50;
  if (cumulativeScore < 3000) return 90;
  return 120;
}

export function formatScore(score: number): string {
  return score.toLocaleString();
}
