"use client";

import { useState, useEffect, useCallback } from "react";
import { GameState, HandEntry, HandResult, DEFAULT_HAND_ENTRY, INITIAL_GAME_STATE } from "@/lib/types";
import { HouseRules } from "@/lib/houseRules";
import { calculateHandScore } from "@/lib/scoring";
import { saveGameState, loadGameState, clearGameState } from "@/lib/storage";
import { GameSetup } from "@/components/GameSetup";
import { ScoreBoard } from "@/components/ScoreBoard";
import { HandScoringForm } from "@/components/HandScoringForm";
import { HandHistory } from "@/components/HandHistory";
import { WinCelebration } from "@/components/WinCelebration";

function freshEntries(): [HandEntry, HandEntry] {
  return [{ ...DEFAULT_HAND_ENTRY }, { ...DEFAULT_HAND_ENTRY }];
}

export default function Home() {
  const [game, setGame] = useState<GameState>(INITIAL_GAME_STATE);
  const [entries, setEntries] = useState<[HandEntry, HandEntry]>(freshEntries());
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingNewGame, setPendingNewGame] = useState(false);

  useEffect(() => {
    const saved = loadGameState();
    if (saved) {
      setGame(saved);
    }
  }, []);

  const saveGame = useCallback((state: GameState) => {
    setGame(state);
    saveGameState(state);
  }, []);

  const handleStart = (teamNames: [string, string], houseRules: HouseRules) => {
    const newGame: GameState = {
      view: "game",
      teamNames,
      targetScore: houseRules.targetScore,
      houseRules,
      cumulativeScores: [0, 0],
      hands: [],
    };
    setEntries(freshEntries());
    saveGame(newGame);
  };

  const updateEntry = (teamIndex: 0 | 1, entry: HandEntry) => {
    setEntries((prev) => {
      const next: [HandEntry, HandEntry] = [prev[0], prev[1]];
      next[teamIndex] = entry;
      if (entry.goingOut !== "none") {
        const other = teamIndex === 0 ? 1 : 0;
        next[other] = { ...next[other], goingOut: "none" };
      }
      return next;
    });
  };

  const handleSubmitHand = () => {
    const rules = game.houseRules;
    const handScores: [number, number] = [
      calculateHandScore(entries[0], rules),
      calculateHandScore(entries[1], rules),
    ];
    const newCumulative: [number, number] = [
      game.cumulativeScores[0] + handScores[0],
      game.cumulativeScores[1] + handScores[1],
    ];
    const handResult: HandResult = {
      handNumber: game.hands.length + 1,
      entries: [{ ...entries[0] }, { ...entries[1] }],
      handScores,
      cumulativeScores: newCumulative,
    };

    const gameOver =
      newCumulative[0] >= game.targetScore ||
      newCumulative[1] >= game.targetScore;

    const newGame: GameState = {
      ...game,
      view: gameOver ? "gameover" : "game",
      cumulativeScores: newCumulative,
      hands: [...game.hands, handResult],
    };

    setEntries(freshEntries());
    saveGame(newGame);
    setShowConfirm(false);
  };

  const handleUndoLastHand = () => {
    if (game.hands.length === 0) return;
    const prevHands = game.hands.slice(0, -1);
    const prevScores: [number, number] =
      prevHands.length > 0
        ? prevHands[prevHands.length - 1].cumulativeScores
        : [0, 0];
    const newGame: GameState = {
      ...game,
      view: "game",
      cumulativeScores: prevScores,
      hands: prevHands,
    };
    saveGame(newGame);
  };

  const handleNewGame = () => {
    clearGameState();
    setEntries(freshEntries());
    setGame(INITIAL_GAME_STATE);
    setPendingNewGame(false);
    setShowConfirm(false);
  };

  if (game.view === "setup") {
    return <GameSetup onStart={handleStart} />;
  }

  if (game.view === "gameover") {
    return (
      <WinCelebration
        teamNames={game.teamNames}
        cumulativeScores={game.cumulativeScores}
        handCount={game.hands.length}
        onNewGame={handleNewGame}
      />
    );
  }

  // Game view
  const handNumber = game.hands.length + 1;
  const team0WentOut = entries[0].goingOut !== "none";
  const team1WentOut = entries[1].goingOut !== "none";
  const activeRules = game.houseRules;

  return (
    <div className="min-h-screen pb-36" style={{ backgroundColor: "#F8F9FC" }}>
      <ScoreBoard
        teamNames={game.teamNames}
        cumulativeScores={game.cumulativeScores}
        targetScore={game.targetScore}
        handCount={game.hands.length}
        houseRules={activeRules}
      />

      <div className="max-w-lg mx-auto px-4 pt-5 space-y-4">
        {/* Hand number header */}
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: "#6B7280" }}
          >
            Hand {handNumber}
          </span>
          <div className="flex-1 h-px" style={{ background: "rgba(99,102,241,0.1)" }} />
        </div>

        {/* Team cards stacked on mobile */}
        <div className="space-y-4 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
          {game.teamNames.map((name, i) => (
            <div key={i} className="glass-card p-5">
              <HandScoringForm
                teamName={name}
                teamIndex={i as 0 | 1}
                entry={entries[i]}
                otherTeamWentOut={i === 0 ? team1WentOut : team0WentOut}
                onChange={(e) => updateEntry(i as 0 | 1, e)}
                houseRules={activeRules}
              />
            </div>
          ))}
        </div>

        <HandHistory hands={game.hands} teamNames={game.teamNames} />
      </div>

      {/* Sticky bottom actions */}
      <div
        className="fixed bottom-0 left-0 right-0 px-4 pt-3 pb-6"
        style={{
          background: "rgba(248,249,252,0.96)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid rgba(99,102,241,0.1)",
          boxShadow: "0 -4px 24px rgba(0,0,0,0.06)",
        }}
      >
        <div className="max-w-lg mx-auto space-y-2.5">
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            className="w-full h-14 rounded-xl text-white text-base font-bold tracking-tight transition-all btn-tactile"
            style={{
              background: "linear-gradient(135deg, #F97316 0%, #EA6C10 100%)",
              boxShadow: "0 4px 16px rgba(249,115,22,0.3)",
            }}
          >
            Calculate &amp; End Hand
          </button>
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={handleUndoLastHand}
              disabled={game.hands.length === 0}
              className="flex-1 h-11 rounded-xl text-sm font-semibold transition-all btn-tactile border"
              style={{
                borderColor: "rgba(99,102,241,0.2)",
                color: game.hands.length === 0 ? "#D1D5DB" : "#6366F1",
                background: "white",
              }}
            >
              Undo Last Hand
            </button>
            <button
              type="button"
              onClick={() => setPendingNewGame(true)}
              className="flex-1 h-11 rounded-xl text-sm font-semibold transition-all btn-tactile border"
              style={{
                borderColor: "rgba(107,114,128,0.2)",
                color: "#6B7280",
                background: "white",
              }}
            >
              New Game
            </button>
          </div>
        </div>
      </div>

      {/* Hand summary confirmation */}
      {showConfirm && (
        <div
          className="fixed inset-0 flex items-end justify-center z-50"
          style={{ background: "rgba(0,0,0,0.45)" }}
        >
          <div
            className="w-full max-w-lg rounded-t-2xl p-5 space-y-4"
            style={{
              background: "white",
              boxShadow: "0 -8px 32px rgba(0,0,0,0.15)",
            }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold" style={{ color: "#111827" }}>
                Hand {handNumber} Summary
              </h3>
              <div
                className="w-1 h-5 rounded-full mx-auto"
                style={{ background: "rgba(0,0,0,0.1)", width: "40px", height: "4px" }}
              />
            </div>
            <div className="space-y-2.5">
              {game.teamNames.map((name, i) => {
                const score = calculateHandScore(entries[i], activeRules);
                const newTotal = game.cumulativeScores[i] + score;
                const isPos = score >= 0;
                return (
                  <div
                    key={i}
                    className="flex justify-between items-center p-4 rounded-xl"
                    style={{
                      background: isPos ? "rgba(22,163,74,0.06)" : "rgba(220,38,38,0.05)",
                      border: `1px solid ${isPos ? "rgba(22,163,74,0.15)" : "rgba(220,38,38,0.12)"}`,
                    }}
                  >
                    <div>
                      <div className="font-semibold" style={{ color: "#111827" }}>
                        {name}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
                        {game.cumulativeScores[i].toLocaleString()} →{" "}
                        <span className="font-bold" style={{ color: "#374151" }}>
                          {newTotal.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div
                      className="text-2xl font-black tabular-nums"
                      style={{ color: isPos ? "#15803d" : "#dc2626" }}
                    >
                      {isPos ? "+" : ""}
                      {score.toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="flex-1 h-13 rounded-xl font-semibold border transition-all btn-tactile"
                style={{ borderColor: "#E5E7EB", color: "#374151" }}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={handleSubmitHand}
                className="flex-1 h-13 rounded-xl font-bold text-white transition-all btn-tactile"
                style={{
                  background: "linear-gradient(135deg, #F97316 0%, #EA6C10 100%)",
                  boxShadow: "0 4px 12px rgba(249,115,22,0.3)",
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New game confirmation */}
      {pendingNewGame && (
        <div
          className="fixed inset-0 flex items-center justify-center p-5 z-50"
          style={{ background: "rgba(0,0,0,0.45)" }}
        >
          <div className="w-full max-w-xs rounded-2xl p-6" style={{ background: "white" }}>
            <p
              className="text-center font-bold text-lg mb-1"
              style={{ color: "#111827" }}
            >
              Start a new game?
            </p>
            <p className="text-center text-sm mb-5" style={{ color: "#6B7280" }}>
              This will clear all current scores.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPendingNewGame(false)}
                className="flex-1 h-12 rounded-xl font-semibold border transition-all btn-tactile"
                style={{ borderColor: "#E5E7EB", color: "#374151" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleNewGame}
                className="flex-1 h-12 rounded-xl font-semibold text-white transition-all btn-tactile"
                style={{ background: "#DC2626" }}
              >
                Clear &amp; Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
