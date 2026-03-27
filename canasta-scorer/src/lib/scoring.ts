import { HandEntry } from "./types";
import { HouseRules, DEFAULT_HOUSE_RULES } from "./houseRules";

function getRedThreeValue(count: number, rules: HouseRules): number {
  if (count === 0) return 0;
  if (count === 4) return rules.allFourRed3sBonus;
  return rules.singleRed3Value * count;
}

export function calculateHandScore(
  entry: HandEntry,
  rules: HouseRules = DEFAULT_HOUSE_RULES
): number {
  let score = entry.meldedPoints;
  score += entry.naturalCanastas * rules.naturalCanastaBonus;
  score += entry.mixedCanastas * rules.mixedCanastaBonus;

  const redThreeValue = getRedThreeValue(entry.redThrees, rules);
  if (entry.hasNoMelds && entry.redThrees > 0) {
    score -= redThreeValue;
  } else {
    score += redThreeValue;
  }

  if (entry.goingOut === "normal") score += rules.goingOutBonus;
  if (entry.goingOut === "concealed") score += rules.goingOutConcealedBonus;

  score -= entry.unmeledPoints;

  return score;
}

export function getMinimumMeld(
  cumulativeScore: number,
  rules: HouseRules = DEFAULT_HOUSE_RULES
): number {
  if (cumulativeScore < 0) return rules.initialMeldScoreNeg;
  if (cumulativeScore < 1500) return rules.initialMeldScore0to1499;
  if (cumulativeScore < 3000) return rules.initialMeldScore1500to2999;
  return rules.initialMeldScore3000plus;
}

export function formatScore(score: number): string {
  return score.toLocaleString();
}
