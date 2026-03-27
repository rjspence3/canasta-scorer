"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface GameSetupProps {
  onStart: (teamNames: [string, string], targetScore: number) => void;
}

const SUITS = ["♠", "♥", "♦", "♣"];

export function GameSetup({ onStart }: GameSetupProps) {
  const [team1, setTeam1] = useState("Team 1");
  const [team2, setTeam2] = useState("Team 2");
  const [targetScore, setTargetScore] = useState(5000);

  const handleStart = () => {
    const t1 = team1.trim() || "Team 1";
    const t2 = team2.trim() || "Team 2";
    onStart([t1, t2], targetScore);
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#F8F9FC" }}
    >
      {/* Felt-green header */}
      <div
        className="felt-header relative flex flex-col items-center justify-center pt-14 pb-10 px-6 overflow-hidden"
      >
        {/* Floating suit watermarks — red suits use red tint */}
        {SUITS.map((suit, i) => {
          const isRed = suit === "♥" || suit === "♦";
          return (
            <span
              key={i}
              className="absolute select-none pointer-events-none font-black"
              style={{
                fontSize: "5rem",
                top: i < 2 ? "8%" : "55%",
                left: i % 2 === 0 ? "4%" : "78%",
                transform: `rotate(${[-12, 15, 20, -18][i]}deg)`,
                color: isRed ? "#ef4444" : "white",
                opacity: isRed ? 0.08 : 0.055,
                lineHeight: 1,
                userSelect: "none",
              }}
            >
              {suit}
            </span>
          );
        })}

        {/* Card stack icon */}
        <div className="relative mb-4">
          <div
            className="w-16 h-20 rounded-xl absolute"
            style={{
              background: "rgba(255,255,255,0.15)",
              transform: "rotate(-8deg) translate(-4px, 3px)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          />
          <div
            className="w-16 h-20 rounded-xl relative flex items-center justify-center"
            style={{
              background: "rgba(255,255,255,0.92)",
              border: "1px solid rgba(255,255,255,0.3)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
            }}
          >
            <span className="text-4xl font-black" style={{ color: "#111827" }}>
              ♠
            </span>
          </div>
        </div>

        <h1
          className="text-3xl font-bold tracking-tight text-white mt-2"
          style={{ textShadow: "0 2px 8px rgba(0,0,0,0.3)" }}
        >
          Canasta Scorer
        </h1>
        <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.7)" }}>
          Classic Partnership Canasta
        </p>
      </div>

      {/* Form card */}
      <div className="flex-1 px-5 pt-6 pb-10 max-w-md mx-auto w-full">
        <div className="glass-card p-6 space-y-5">
          {/* Team names */}
          <div>
            <p
              className="text-xs font-medium uppercase tracking-wider mb-3"
              style={{ color: "#6B7280" }}
            >
              Team Names
            </p>
            <div className="space-y-3">
              <div>
                <Label
                  htmlFor="team1"
                  className="text-sm font-medium mb-1.5 block"
                  style={{ color: "#374151" }}
                >
                  <span className="mr-1.5" style={{ color: "#6366F1" }}>♠♣</span>
                  First Team
                </Label>
                <Input
                  id="team1"
                  value={team1}
                  onChange={(e) => setTeam1(e.target.value)}
                  placeholder="Team 1"
                  className="text-base font-medium h-12"
                  style={{ borderColor: "rgba(99,102,241,0.2)" }}
                />
              </div>
              <div>
                <Label
                  htmlFor="team2"
                  className="text-sm font-medium mb-1.5 block"
                  style={{ color: "#374151" }}
                >
                  <span className="mr-1.5" style={{ color: "#dc2626" }}>♥♦</span>
                  Second Team
                </Label>
                <Input
                  id="team2"
                  value={team2}
                  onChange={(e) => setTeam2(e.target.value)}
                  placeholder="Team 2"
                  className="text-base font-medium h-12"
                  style={{ borderColor: "rgba(99,102,241,0.2)" }}
                />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ borderTop: "1px solid rgba(99,102,241,0.1)" }} />

          {/* Target score */}
          <div>
            <p
              className="text-xs font-medium uppercase tracking-wider mb-3"
              style={{ color: "#6B7280" }}
            >
              Target Score
            </p>
            <div className="flex gap-2">
              {[5000, 8500].map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => setTargetScore(score)}
                  className="flex-1 h-12 rounded-xl border text-sm font-semibold transition-all btn-tactile"
                  style={
                    targetScore === score
                      ? {
                          background: "#6366F1",
                          color: "white",
                          border: "1px solid #6366F1",
                          boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
                        }
                      : {
                          background: "white",
                          color: "#374151",
                          border: "1px solid rgba(99,102,241,0.2)",
                        }
                  }
                >
                  {score.toLocaleString()}
                </button>
              ))}
              <Input
                id="target"
                type="number"
                value={targetScore}
                onChange={(e) =>
                  setTargetScore(Number(e.target.value) || 5000)
                }
                className="w-24 text-base font-semibold h-12 text-center"
                style={{ borderColor: "rgba(99,102,241,0.2)" }}
                min={1000}
                step={500}
              />
            </div>
          </div>

          {/* Start button */}
          <button
            type="button"
            onClick={handleStart}
            className="w-full h-14 rounded-xl text-white text-lg font-bold tracking-tight transition-all btn-tactile mt-1"
            style={{
              background: "linear-gradient(135deg, #F97316 0%, #EA6C10 100%)",
              boxShadow: "0 6px 20px rgba(249,115,22,0.35)",
            }}
          >
            Start Game
          </button>

          {/* Card values reference */}
          <div
            className="text-xs text-center space-y-1 pt-1"
            style={{ color: "#9CA3AF" }}
          >
            <p>Joker 50 · 2 or A 20 · K–8 10 · 7–4 or ♣♠3 5</p>
            <p>Natural canasta 500 · Mixed canasta 300</p>
          </div>
        </div>
      </div>
    </div>
  );
}
