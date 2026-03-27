"use client";

import { formatScore, getMinimumMeld } from "@/lib/scoring";

interface ScoreBoardProps {
  teamNames: [string, string];
  cumulativeScores: [number, number];
  targetScore: number;
  handCount: number;
}

const MELD_TIER_STYLE = (meld: number) => {
  if (meld <= 50)
    return { bg: "rgba(22,163,74,0.15)", text: "#15803d", label: "50 min" };
  if (meld <= 90)
    return { bg: "rgba(202,138,4,0.15)", text: "#b45309", label: "90 min" };
  if (meld <= 120)
    return { bg: "rgba(234,88,12,0.15)", text: "#c2410c", label: "120 min" };
  return { bg: "rgba(220,38,38,0.15)", text: "#b91c1c", label: `${meld} min` };
};

export function ScoreBoard({
  teamNames,
  cumulativeScores,
  targetScore,
  handCount,
}: ScoreBoardProps) {
  const gap = Math.abs(cumulativeScores[0] - cumulativeScores[1]);
  const leadingIndex =
    cumulativeScores[0] > cumulativeScores[1]
      ? 0
      : cumulativeScores[1] > cumulativeScores[0]
      ? 1
      : -1;
  const tied = leadingIndex === -1;

  return (
    <div
      className="sticky top-0 z-10"
      style={{
        background: "linear-gradient(160deg, #14532d 0%, #166534 100%)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
      }}
    >
      {/* Suit watermarks in header */}
      <div className="relative overflow-hidden">
        <span
          className="absolute suit-watermark text-white text-6xl"
          style={{ right: "8px", top: "-4px", transform: "rotate(10deg)" }}
        >
          ♠
        </span>
        <span
          className="absolute suit-watermark text-white text-5xl"
          style={{ left: "6px", bottom: "-2px", transform: "rotate(-8deg)" }}
        >
          ♣
        </span>

        <div className="max-w-lg mx-auto px-4 pt-4 pb-3">
          {/* Team score panels */}
          <div className="grid grid-cols-2 gap-3">
            {teamNames.map((name, i) => {
              const score = cumulativeScores[i];
              const pct = Math.min(100, Math.max(0, (Math.max(0, score) / targetScore) * 100));
              const isLeading = i === leadingIndex;
              const meld = getMinimumMeld(score);
              const meldStyle = MELD_TIER_STYLE(meld);
              const isNeg = score < 0;

              return (
                <div
                  key={i}
                  className="rounded-xl p-3 relative overflow-hidden"
                  style={{
                    background: isLeading
                      ? "rgba(255,255,255,0.18)"
                      : "rgba(255,255,255,0.08)",
                    border: isLeading
                      ? "1px solid rgba(255,255,255,0.35)"
                      : "1px solid rgba(255,255,255,0.12)",
                    boxShadow: isLeading ? "0 2px 12px rgba(0,0,0,0.15)" : "none",
                  }}
                >
                  {/* Leading indicator */}
                  {isLeading && !tied && (
                    <span
                      className="absolute top-2 right-2 text-xs font-bold px-1.5 py-0.5 rounded-full"
                      style={{
                        background: "rgba(249,115,22,0.9)",
                        color: "white",
                        fontSize: "9px",
                        letterSpacing: "0.05em",
                      }}
                    >
                      LEAD
                    </span>
                  )}

                  {/* Team name */}
                  <div
                    className="text-xs font-semibold uppercase tracking-wider truncate mb-1"
                    style={{ color: "rgba(255,255,255,0.65)" }}
                  >
                    {name}
                  </div>

                  {/* Big score */}
                  <div
                    className="text-4xl font-black tabular-nums leading-none score-transition"
                    style={{
                      color: isNeg ? "#fca5a5" : "white",
                      textShadow: isLeading ? "0 2px 8px rgba(0,0,0,0.3)" : "none",
                    }}
                  >
                    {isNeg && "−"}
                    {formatScore(Math.abs(score))}
                  </div>

                  {/* Progress bar */}
                  <div
                    className="mt-2 h-1.5 rounded-full overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.15)" }}
                  >
                    <div
                      className="h-full rounded-full progress-fill"
                      style={{
                        width: `${pct}%`,
                        background: isLeading
                          ? "linear-gradient(90deg, #F97316, #fbbf24)"
                          : "rgba(255,255,255,0.5)",
                      }}
                    />
                  </div>

                  {/* Meld minimum badge */}
                  <div className="mt-2">
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{
                        background: meldStyle.bg,
                        color: meldStyle.text,
                        backdropFilter: "blur(4px)",
                      }}
                    >
                      {meldStyle.label} meld
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Gap indicator + hand info */}
          <div className="flex items-center justify-between mt-2.5 px-0.5">
            <span
              className="text-xs"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              Hand {handCount + 1} · Target {formatScore(targetScore)}
            </span>
            {!tied && gap > 0 && (
              <span
                className="text-xs font-semibold"
                style={{ color: "rgba(255,255,255,0.65)" }}
              >
                Gap: {formatScore(gap)}
              </span>
            )}
            {tied && (
              <span
                className="text-xs font-semibold"
                style={{ color: "rgba(255,255,255,0.65)" }}
              >
                Tied
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
