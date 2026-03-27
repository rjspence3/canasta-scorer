import { GameState } from "./types";
import { DEFAULT_HOUSE_RULES } from "./houseRules";

const STORAGE_KEY = "canasta-game-state";

export function saveGameState(state: GameState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage may be unavailable in some environments
  }
}

export function loadGameState(): GameState | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved) as GameState;
    // Backfill houseRules for games saved before this field existed
    if (!parsed.houseRules) {
      parsed.houseRules = { ...DEFAULT_HOUSE_RULES, targetScore: parsed.targetScore };
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearGameState(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // localStorage may be unavailable
  }
}
