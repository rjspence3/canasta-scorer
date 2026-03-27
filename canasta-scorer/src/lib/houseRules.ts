export interface HouseRules {
  targetScore: number;
  naturalCanastaBonus: number;
  mixedCanastaBonus: number;
  goingOutBonus: number;
  goingOutConcealedBonus: number;
  singleRed3Value: number;
  allFourRed3sBonus: number;
  initialMeldScoreNeg: number;
  initialMeldScore0to1499: number;
  initialMeldScore1500to2999: number;
  initialMeldScore3000plus: number;
  black3Penalty: number;
  maxWildsPerMeld: number;
}

export const DEFAULT_HOUSE_RULES: HouseRules = {
  targetScore: 5000,
  naturalCanastaBonus: 500,
  mixedCanastaBonus: 300,
  goingOutBonus: 100,
  goingOutConcealedBonus: 200,
  singleRed3Value: 100,
  allFourRed3sBonus: 800,
  initialMeldScoreNeg: 15,
  initialMeldScore0to1499: 50,
  initialMeldScore1500to2999: 90,
  initialMeldScore3000plus: 120,
  black3Penalty: 5,
  maxWildsPerMeld: 3,
};

export const HOUSE_RULES_OPTIONS: Record<keyof HouseRules, readonly number[]> = {
  targetScore: [3000, 5000, 7500, 10000],
  naturalCanastaBonus: [300, 500, 750],
  mixedCanastaBonus: [150, 300, 500],
  goingOutBonus: [50, 100, 200],
  goingOutConcealedBonus: [100, 200, 300],
  singleRed3Value: [50, 100, 200],
  allFourRed3sBonus: [400, 800, 1200],
  initialMeldScoreNeg: [0, 15, 25],
  initialMeldScore0to1499: [15, 50, 90],
  initialMeldScore1500to2999: [50, 90, 120],
  initialMeldScore3000plus: [90, 120, 150],
  black3Penalty: [0, 5, 15],
  maxWildsPerMeld: [1, 2, 3],
};

export const HOUSE_RULES_LABELS: Record<keyof HouseRules, string> = {
  targetScore: "Target score",
  naturalCanastaBonus: "Natural canasta bonus",
  mixedCanastaBonus: "Mixed canasta bonus",
  goingOutBonus: "Going out bonus",
  goingOutConcealedBonus: "Going out concealed",
  singleRed3Value: "Red 3 value (single)",
  allFourRed3sBonus: "All 4 red 3s bonus",
  initialMeldScoreNeg: "Initial meld (score < 0)",
  initialMeldScore0to1499: "Initial meld (0–1,499)",
  initialMeldScore1500to2999: "Initial meld (1,500–2,999)",
  initialMeldScore3000plus: "Initial meld (3,000+)",
  black3Penalty: "Black 3 penalty",
  maxWildsPerMeld: "Wilds per meld (max)",
};

export function formatRuleValue(key: keyof HouseRules, value: number): string {
  if (key === "targetScore") return value.toLocaleString();
  if (key === "maxWildsPerMeld") return `${value}`;
  if (key === "black3Penalty") return `${value} pts each`;
  if (
    key === "initialMeldScoreNeg" ||
    key === "initialMeldScore0to1499" ||
    key === "initialMeldScore1500to2999" ||
    key === "initialMeldScore3000plus"
  ) {
    return `${value} pts`;
  }
  return `+${value} pts`;
}

export function isDefaultRules(rules: HouseRules): boolean {
  return (Object.keys(DEFAULT_HOUSE_RULES) as (keyof HouseRules)[]).every(
    (key) => rules[key] === DEFAULT_HOUSE_RULES[key]
  );
}
