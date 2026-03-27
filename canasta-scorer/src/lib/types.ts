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
