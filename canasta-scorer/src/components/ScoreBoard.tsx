"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { formatScore, getMinimumMeld } from "@/lib/scoring";

interface ScoreBoardProps {
  teamNames: [string, string];
  cumulativeScores: [number, number];
  targetScore: number;
  handCount: number;
}

const MELD_TIER = (meld: number) => {
  if (meld <= 50) return { cls: "meld-badge-green", label: "50 min" };
  if (meld <= 90) return { cls: "meld-badge-amber", label: "90 min" };
  if (meld <= 120) return { cls: "meld-badge-orange", label: "120 min" };
  return { cls: "meld-badge-red", label: `${meld} min` };
};

function AnimatedScore({
  value,
  isNeg,
  isLeading,
}: {
  value: number;
  isNeg: boolean;
  isLeading: boolean;
}) {
  const motionVal = useMotionValue(value);
  const spring = useSpring(motionVal, { stiffness: 55, damping: 18, mass: 1 });
  const displayed = useTransform(spring, (n) => formatScore(Math.round(Math.abs(n))));
  const prevRef = useRef(value);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    if (prevRef.current !== value) {
      motionVal.set(value);
      setAnimKey((k) => k + 1);
      prevRef.current = value;
    }
  }, [value, motionVal]);

  return (
    <div
      key={animKey}
      className="text-4xl font-black tabular-nums leading-none score-tick-in"
      style={{
        color: isNeg ? "#fca5a5" : "white",
        textShadow: isLeading ? "0 2px 10px rgba(0,0,0,0.35)" : "none",
      }}
    >
      {isNeg && "−"}
      <motion.span>{displayed}</motion.span>
    </div>
  );
}

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
      className="sticky top-0 z-10 felt-header"
      style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.25)" }}
    >
      <div className="relative overflow-hidden">
        {/* All 4 suit watermarks */}
        <span
          className="absolute suit-watermark text-white"
          style={{ fontSize: "4.5rem", right: "6px", top: "-6px", transform: "rotate(12deg)" }}
        >
          ♠
        </span>
        <span
          className="absolute suit-watermark"
          style={{ fontSize: "3.5rem", right: "52px", bottom: "0px", transform: "rotate(-6deg)", color: "#ef4444", opacity: 0.08 }}
        >
          ♥
        </span>
        <span
          className="absolute suit-watermark text-white"
          style={{ fontSize: "4rem", left: "4px", bottom: "-4px", transform: "rotate(-10deg)" }}
        >
          ♣
        </span>
        <span
          className="absolute suit-watermark"
          style={{ fontSize: "3rem", left: "46px", top: "4px", transform: "rotate(7deg)", color: "#ef4444", opacity: 0.08 }}
        >
          ♦
        </span>

        <div className="max-w-lg mx-auto px-4 pt-4 pb-3">
          {/* Team score panels */}
          <div className="grid grid-cols-2 gap-3">
            {teamNames.map((name, i) => {
              const score = cumulativeScores[i];
              const pct = Math.min(100, Math.max(0, (Math.max(0, score) / targetScore) * 100));
              const isLeading = i === leadingIndex;
              const meld = getMinimumMeld(score);
              const tier = MELD_TIER(meld);
              const isNeg = score < 0;

              return (
                <div
                  key={i}
                  className="rounded-2xl p-3 relative overflow-hidden"
                  style={{
                    background: isLeading
                      ? "rgba(255,255,255,0.18)"
                      : "rgba(255,255,255,0.08)",
                    border: isLeading
                      ? "1px solid rgba(255,255,255,0.38)"
                      : "1px solid rgba(255,255,255,0.12)",
                    boxShadow: isLeading ? "0 2px 16px rgba(0,0,0,0.18)" : "none",
                    transition: "box-shadow 0.3s ease, background 0.3s ease",
                  }}
                >
                  {/* LEAD badge */}
                  {isLeading && !tied && (
                    <span
                      className="absolute top-2 right-2 text-xs font-bold px-1.5 py-0.5 rounded-full"
                      style={{
                        background: "rgba(249,115,22,0.92)",
                        color: "white",
                        fontSize: "9px",
                        letterSpacing: "0.06em",
                      }}
                    >
                      LEAD
                    </span>
                  )}

                  {/* Team name */}
                  <div
                    className="text-xs font-semibold uppercase tracking-wider truncate mb-1"
                    style={{ color: "rgba(255,255,255,0.62)" }}
                  >
                    {name}
                  </div>

                  {/* Animated score counter */}
                  <AnimatedScore value={score} isNeg={isNeg} isLeading={isLeading} />

                  {/* Progress bar */}
                  <div
                    className="mt-2 h-1.5 rounded-full overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.14)" }}
                  >
                    <div
                      className="h-full rounded-full progress-fill"
                      style={{
                        width: `${pct}%`,
                        background: isLeading
                          ? "linear-gradient(90deg, #F97316, #fbbf24)"
                          : "rgba(255,255,255,0.48)",
                      }}
                    />
                  </div>

                  {/* Color-coded meld minimum badge */}
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${tier.cls}`}>
                      {tier.label} meld
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Gap indicator + hand info */}
          <div className="flex items-center justify-between mt-2.5 px-0.5">
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.48)" }}>
              Hand {handCount + 1} · Target {formatScore(targetScore)}
            </span>
            {!tied && gap > 0 && (
              <span className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.65)" }}>
                Gap: {formatScore(gap)}
              </span>
            )}
            {tied && (
              <span className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.65)" }}>
                Tied
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
