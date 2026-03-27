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
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
      >
        <span>Score History ({hands.length} hand{hands.length !== 1 ? "s" : ""})</span>
        {expanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {expanded && (
        <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden bg-white">
          {/* Header */}
          <div className="grid grid-cols-3 gap-2 px-3 py-2 bg-gray-50 border-b border-gray-100">
            <span className="text-xs font-semibold text-gray-500">Hand</span>
            <span className="text-xs font-semibold text-gray-500 text-right">
              {teamNames[0]}
            </span>
            <span className="text-xs font-semibold text-gray-500 text-right">
              {teamNames[1]}
            </span>
          </div>

          {/* Rows — newest first */}
          {[...hands].reverse().map((hand) => (
            <div
              key={hand.handNumber}
              className="grid grid-cols-3 gap-2 px-3 py-2.5 border-b border-gray-50 last:border-0"
            >
              <span className="text-xs text-gray-500">#{hand.handNumber}</span>
              <div className="text-right">
                <div
                  className={`text-sm font-semibold tabular-nums ${
                    hand.handScores[0] >= 0
                      ? "text-green-700"
                      : "text-red-600"
                  }`}
                >
                  {hand.handScores[0] >= 0 ? "+" : ""}
                  {formatScore(hand.handScores[0])}
                </div>
                <div className="text-xs text-gray-500 tabular-nums">
                  = {formatScore(hand.cumulativeScores[0])}
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`text-sm font-semibold tabular-nums ${
                    hand.handScores[1] >= 0
                      ? "text-green-700"
                      : "text-red-600"
                  }`}
                >
                  {hand.handScores[1] >= 0 ? "+" : ""}
                  {formatScore(hand.handScores[1])}
                </div>
                <div className="text-xs text-gray-500 tabular-nums">
                  = {formatScore(hand.cumulativeScores[1])}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
