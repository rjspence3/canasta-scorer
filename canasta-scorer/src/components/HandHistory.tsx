"use client";

import { useState } from "react";
import { HandResult } from "@/lib/types";
import { formatScore } from "@/lib/scoring";
import { ChevronDown, ChevronUp } from "lucide-react";

interface HandHistoryProps {
  hands: HandResult[];
  teamNames: [string, string];
}

export function HandHistory({ hands, teamNames }: HandHistoryProps) {
  const [expanded, setExpanded] = useState(false);

  if (hands.length === 0) return null;

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all btn-tactile"
        style={{
          background: "rgba(99,102,241,0.06)",
          border: "1px solid rgba(99,102,241,0.12)",
          color: "#4338CA",
        }}
      >
        <span>
          Score History
          <span
            className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold"
            style={{ background: "rgba(99,102,241,0.12)", color: "#6366F1" }}
          >
            {hands.length}
          </span>
        </span>
        {expanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {expanded && (
        <div
          className="mt-2 rounded-xl overflow-hidden"
          style={{
            border: "1px solid rgba(99,102,241,0.12)",
            background: "rgba(255,255,255,0.9)",
          }}
        >
          {/* Header */}
          <div
            className="grid grid-cols-3 gap-2 px-4 py-2.5"
            style={{ background: "rgba(99,102,241,0.05)", borderBottom: "1px solid rgba(99,102,241,0.08)" }}
          >
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#6B7280" }}>
              Hand
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-right" style={{ color: "#6B7280" }}>
              {teamNames[0]}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-right" style={{ color: "#6B7280" }}>
              {teamNames[1]}
            </span>
          </div>

          {/* Rows — newest first */}
          {[...hands].reverse().map((hand, idx) => {
            const winner =
              hand.handScores[0] > hand.handScores[1]
                ? 0
                : hand.handScores[1] > hand.handScores[0]
                ? 1
                : -1;
            const isFirst = idx === 0;
            return (
              <div
                key={hand.handNumber}
                className="grid grid-cols-3 gap-2 px-4 py-2.5"
                style={{
                  borderBottom: "1px solid rgba(99,102,241,0.06)",
                  background: isFirst ? "rgba(99,102,241,0.03)" : "transparent",
                }}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold" style={{ color: "#9CA3AF" }}>
                    #{hand.handNumber}
                  </span>
                  {isFirst && (
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                      style={{ background: "rgba(99,102,241,0.1)", color: "#6366F1", fontSize: "9px" }}
                    >
                      LAST
                    </span>
                  )}
                </div>

                {[0, 1].map((i) => (
                  <div key={i} className="text-right">
                    <div
                      className="text-sm font-bold tabular-nums"
                      style={{
                        color:
                          hand.handScores[i] > 0
                            ? winner === i
                              ? "#15803d"
                              : "#16a34a"
                            : hand.handScores[i] < 0
                            ? "#dc2626"
                            : "#6B7280",
                      }}
                    >
                      {hand.handScores[i] >= 0 ? "+" : ""}
                      {formatScore(hand.handScores[i])}
                    </div>
                    <div className="text-xs tabular-nums" style={{ color: "#9CA3AF" }}>
                      = {formatScore(hand.cumulativeScores[i])}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
