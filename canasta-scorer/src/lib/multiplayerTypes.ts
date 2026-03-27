import type { HandEntry, HandResult } from "./types";
import type { HouseRules } from "./houseRules";

export interface CurrentHand {
  team0_submitted: boolean;
  team1_submitted: boolean;
  team0_entry: HandEntry | null;
  team1_entry: HandEntry | null;
}

export interface MultiplayerGameState {
  team_names: [string, string];
  target_score: number;
  house_rules?: HouseRules;
  cumulative_scores: [number, number];
  hands: HandResult[];
  current_hand: CurrentHand;
  status: "active" | "gameover";
}

export type MyTeam = 0 | 1;
