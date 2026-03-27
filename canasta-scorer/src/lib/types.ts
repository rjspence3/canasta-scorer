import { HouseRules, DEFAULT_HOUSE_RULES } from "./houseRules";

export type GameView = "setup" | "game" | "gameover";
export type GoingOut = "none" | "normal" | "concealed";

export interface HandEntry {
  meldedPoints: number;
  naturalCanastas: number;
  mixedCanastas: number;
  redThrees: number;
  hasNoMelds: boolean;
  goingOut: GoingOut;
  unmeledPoints: number;
}

export interface HandResult {
  handNumber: number;
  entries: [HandEntry, HandEntry];
  handScores: [number, number];
  cumulativeScores: [number, number];
}

export interface GameState {
  view: GameView;
  teamNames: [string, string];
  targetScore: number;
  houseRules: HouseRules;
  cumulativeScores: [number, number];
  hands: HandResult[];
}

export const DEFAULT_HAND_ENTRY: HandEntry = {
  meldedPoints: 0,
  naturalCanastas: 0,
  mixedCanastas: 0,
  redThrees: 0,
  hasNoMelds: false,
  goingOut: "none",
  unmeledPoints: 0,
};

export const INITIAL_GAME_STATE: GameState = {
  view: "setup",
  teamNames: ["Team 1", "Team 2"],
  targetScore: DEFAULT_HOUSE_RULES.targetScore,
  houseRules: DEFAULT_HOUSE_RULES,
  cumulativeScores: [0, 0],
  hands: [],
};
