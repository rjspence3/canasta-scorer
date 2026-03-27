"use client";

import { formatScore, getMinimumMeld } from "@/lib/scoring";
import { Badge } from "@/components/ui/badge";

interface ScoreBoardProps {
  teamNames: [string, string];
  cumulativeScores: [number, number];
  targetScore: number;
  handCount: number;
}

export function ScoreBoard({
  teamNames,
  cumulativeScores,
  targetScore,
  handCount,
}: ScoreBoardProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10 shadow-sm">
      <div className="flex justify-between items-start gap-3 max-w-lg mx-auto">
        {teamNames.map((name, i) => {
          const score = cumulativeScores[i];
          const pct = Math.min(100, Math.max(0, (score / targetScore) * 100));
          const minMeld = getMinimumMeld(score);
          const isLeading = score > cumulativeScores[1 - i];
          const isNegative = score < 0;

          return (
            <div key={i} className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-xs font-medium text-gray-500 truncate">
                  {name}
                </span>
                {isLeading && score !== cumulativeScores[1 - i] && (
                  <Badge variant="success" className="text-xs px-1.5 py-0">
                    ▲
                  </Badge>
                )}
              </div>
              <div
                className={`text-3xl font-bold tabular-nums leading-none ${
                  isNegative ? "text-red-600" : "text-gray-900"
                }`}
              >
                {isNegative ? "−" : ""}
                {formatScore(Math.abs(score))}
              </div>
              <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="mt-1 text-xs text-gray-400">
                Min meld: <span className="font-medium text-gray-600">{minMeld}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="text-center mt-1">
        <span className="text-xs text-gray-400">
          Hand {handCount + 1} • Target: {formatScore(targetScore)}
        </span>
      </div>
    </div>
  );
}
