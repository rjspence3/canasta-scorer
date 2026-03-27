"use client";

import { useState, useEffect, useCallback } from "react";
import { GameState, HandEntry, HandResult, DEFAULT_HAND_ENTRY } from "@/lib/types";
import { calculateHandScore } from "@/lib/scoring";
import { saveGameState, loadGameState, clearGameState } from "@/lib/storage";
import { GameSetup } from "@/components/GameSetup";
import { ScoreBoard } from "@/components/ScoreBoard";
import { HandScoringForm } from "@/components/HandScoringForm";
import { HandHistory } from "@/components/HandHistory";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const INITIAL_STATE: GameState = {
  view: "setup",
  teamNames: ["Team 1", "Team 2"],
  targetScore: 5000,
  cumulativeScores: [0, 0],
  hands: [],
};

function freshEntries(): [HandEntry, HandEntry] {
  return [{ ...DEFAULT_HAND_ENTRY }, { ...DEFAULT_HAND_ENTRY }];
}

export default function Home() {
  const [game, setGame] = useState<GameState>(INITIAL_STATE);
  const [entries, setEntries] = useState<[HandEntry, HandEntry]>(freshEntries());
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingNewGame, setPendingNewGame] = useState(false);

  // Load persisted state on mount
  useEffect(() => {
    const saved = loadGameState();
    if (saved) setGame(saved);
  }, []);

  // Persist on state changes
  const saveGame = useCallback(
    (state: GameState) => {
      setGame(state);
      saveGameState(state);
    },
    []
  );

  const handleStart = (teamNames: [string, string], targetScore: number) => {
    const newGame: GameState = {
      view: "game",
      teamNames,
      targetScore,
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
      // Mutual exclusion on "going out"
      if (entry.goingOut !== "none") {
        const other = teamIndex === 0 ? 1 : 0;
        next[other] = { ...next[other], goingOut: "none" };
      }
      return next;
    });
  };

  const handleSubmitHand = () => {
    const handScores: [number, number] = [
      calculateHandScore(entries[0]),
      calculateHandScore(entries[1]),
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
    setGame(INITIAL_STATE);
    setPendingNewGame(false);
    setShowConfirm(false);
  };

  if (game.view === "setup") {
    return <GameSetup onStart={handleStart} />;
  }

  if (game.view === "gameover") {
    const winner =
      game.cumulativeScores[0] > game.cumulativeScores[1] ? 0 : 1;
    const tied = game.cumulativeScores[0] === game.cumulativeScores[1];
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-sm shadow-md text-center">
          <CardContent className="pt-8 pb-6 space-y-4">
            <div className="text-5xl">{tied ? "🤝" : "🏆"}</div>
            <h2 className="text-2xl font-bold">
              {tied ? "It&apos;s a Tie!" : `${game.teamNames[winner]} Wins!`}
            </h2>
            <div className="space-y-2 mt-4">
              {game.teamNames.map((name, i) => (
                <div
                  key={i}
                  className={`flex justify-between items-center px-4 py-3 rounded-lg ${
                    !tied && i === winner
                      ? "bg-blue-50 border border-blue-200"
                      : "bg-gray-50"
                  }`}
                >
                  <span className="font-medium">{name}</span>
                  <span className="text-2xl font-bold tabular-nums">
                    {game.cumulativeScores[i].toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            <div className="text-sm text-gray-500 mt-2">
              {game.hands.length} hand{game.hands.length !== 1 ? "s" : ""} played
            </div>
            <HandHistory hands={game.hands} teamNames={game.teamNames} />
            <Button
              onClick={() => setPendingNewGame(true)}
              size="lg"
              className="w-full mt-4"
            >
              New Game
            </Button>
          </CardContent>
        </Card>

        {pendingNewGame && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-xs">
              <CardContent className="pt-6 space-y-4">
                <p className="text-center font-medium">Start a new game?</p>
                <p className="text-sm text-gray-500 text-center">
                  Current game will be cleared.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPendingNewGame(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleNewGame} className="flex-1">
                    New Game
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  // Game view
  const handNumber = game.hands.length + 1;
  const team0WentOut = entries[0].goingOut !== "none";
  const team1WentOut = entries[1].goingOut !== "none";

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <ScoreBoard
        teamNames={game.teamNames}
        cumulativeScores={game.cumulativeScores}
        targetScore={game.targetScore}
        handCount={game.hands.length}
      />

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Hand {handNumber} Entry
        </h2>

        {/* Team cards side by side on wider screens, stacked on mobile */}
        <div className="space-y-4 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
          {game.teamNames.map((name, i) => (
            <Card key={i} className="shadow-sm">
              <CardContent className="pt-5 pb-5">
                <HandScoringForm
                  teamName={name}
                  teamIndex={i as 0 | 1}
                  entry={entries[i]}
                  otherTeamWentOut={i === 0 ? team1WentOut : team0WentOut}
                  onChange={(e) => updateEntry(i as 0 | 1, e)}
                />
              </CardContent>
            </Card>
          ))}
        </div>

        <HandHistory hands={game.hands} teamNames={game.teamNames} />
      </div>

      {/* Sticky bottom actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 space-y-2">
        <div className="max-w-lg mx-auto space-y-2">
          <Button
            onClick={() => setShowConfirm(true)}
            size="xl"
            className="w-full font-semibold"
          >
            Calculate &amp; End Hand
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleUndoLastHand}
              disabled={game.hands.length === 0}
              className="flex-1 text-sm"
            >
              Undo Last Hand
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPendingNewGame(true)}
              className="flex-1 text-sm"
            >
              New Game
            </Button>
          </div>
        </div>
      </div>

      {/* Hand summary confirmation */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50">
          <div className="w-full max-w-lg bg-white rounded-t-2xl p-5 space-y-4">
            <h3 className="text-lg font-bold text-center">Hand {handNumber} Summary</h3>
            <div className="space-y-2">
              {game.teamNames.map((name, i) => {
                const score = calculateHandScore(entries[i]);
                const newTotal = game.cumulativeScores[i] + score;
                return (
                  <div
                    key={i}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{name}</div>
                      <div className="text-xs text-gray-500">
                        {game.cumulativeScores[i].toLocaleString()} →{" "}
                        <span className="font-semibold text-gray-700">
                          {newTotal.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`text-xl font-bold tabular-nums ${
                        score >= 0 ? "text-green-700" : "text-red-600"
                      }`}
                    >
                      {score >= 0 ? "+" : ""}
                      {score.toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                onClick={() => setShowConfirm(false)}
                className="flex-1"
              >
                Edit
              </Button>
              <Button onClick={handleSubmitHand} className="flex-1 font-semibold">
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* New game confirmation */}
      {pendingNewGame && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-xs">
            <CardContent className="pt-6 space-y-4">
              <p className="text-center font-medium">Start a new game?</p>
              <p className="text-sm text-gray-500 text-center">
                This will clear all current scores.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPendingNewGame(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleNewGame}
                  className="flex-1"
                >
                  Clear &amp; Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
