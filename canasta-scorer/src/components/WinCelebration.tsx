"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { formatScore } from "@/lib/scoring";

interface WinCelebrationProps {
  teamNames: [string, string];
  cumulativeScores: [number, number];
  handCount: number;
  onNewGame: () => void;
}

const CONFETTI_COUNT = 24;
const SUITS = ["♠", "♥", "♦", "♣"];

function ConfettiPiece({ index }: { index: number }) {
  const suit = SUITS[index % 4];
  const isRed = suit === "♥" || suit === "♦";
  const delay = (index * 0.06) % 1.0;
  const x = -50 + (index * 41) % 130;
  const duration = 1.6 + (index * 0.11) % 1.0;
  const size = 18 + (index * 7) % 14;

  return (
    <motion.div
      className="absolute select-none pointer-events-none font-black"
      style={{
        left: "50%",
        top: "15%",
        fontSize: `${size}px`,
        color: isRed ? "#ef4444" : "#1f2937",
      }}
      initial={{ opacity: 0, y: 0, x: `${x}px`, scale: 0, rotate: 0 }}
      animate={{
        opacity: [0, 1, 1, 0],
        y: [0, -60, -130, -210],
        scale: [0, 1.3, 1, 0.5],
        rotate: [0, 200, 380, 540],
      }}
      transition={{
        duration,
        delay,
        ease: "easeOut",
        repeat: Infinity,
        repeatDelay: 0.8,
      }}
    >
      {suit}
    </motion.div>
  );
}

function AnimatedFinalScore({ target }: { target: number }) {
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 35, damping: 15, mass: 1.2 });
  const displayed = useTransform(spring, (n) => formatScore(Math.round(n)));

  useEffect(() => {
    const t = setTimeout(() => motionVal.set(target), 350);
    return () => clearTimeout(t);
  }, [target, motionVal]);

  return <motion.span>{displayed}</motion.span>;
}

export function WinCelebration({
  teamNames,
  cumulativeScores,
  handCount,
  onNewGame,
}: WinCelebrationProps) {
  const [visible, setVisible] = useState(false);
  const [pendingNewGame, setPendingNewGame] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const winner =
    cumulativeScores[0] > cumulativeScores[1]
      ? 0
      : cumulativeScores[1] > cumulativeScores[0]
      ? 1
      : -1;
  const tied = winner === -1;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 py-10 relative overflow-hidden felt-header"
    >
      {/* Large background suit watermarks */}
      {(["♠", "♥", "♦", "♣"] as const).map((suit, i) => {
        const isRed = suit === "♥" || suit === "♦";
        return (
          <span
            key={i}
            className="absolute select-none pointer-events-none font-black"
            style={{
              fontSize: "9rem",
              top: i < 2 ? "4%" : "62%",
              left: i % 2 === 0 ? "1%" : "70%",
              transform: `rotate(${[-14, 11, 17, -9][i]}deg)`,
              color: isRed ? "#ef4444" : "white",
              opacity: isRed ? 0.07 : 0.055,
            }}
          >
            {suit}
          </span>
        );
      })}

      {/* Confetti */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: CONFETTI_COUNT }, (_, i) => (
          <ConfettiPiece key={i} index={i} />
        ))}
      </div>

      <AnimatePresence>
        {visible && (
          <motion.div
            className="relative z-10 w-full max-w-sm"
            initial={{ opacity: 0, y: 44, scale: 0.88 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          >
            {/* Trophy / tie icon */}
            <div className="text-center mb-5">
              <span className={tied ? "text-8xl" : "trophy-bounce text-8xl"}>
                {tied ? "🤝" : "🏆"}
              </span>
            </div>

            {/* Result card */}
            <div
              className="rounded-2xl p-6"
              style={{
                background: "rgba(255,255,255,0.97)",
                boxShadow: "0 28px 72px rgba(0,0,0,0.35)",
              }}
            >
              <motion.h1
                className="text-3xl font-black tracking-tight text-center mb-1"
                style={{ color: "#111827" }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {tied ? "It's a Tie!" : `${teamNames[winner]} Wins!`}
              </motion.h1>
              <p className="text-center text-sm mb-5" style={{ color: "#6B7280" }}>
                {handCount} hand{handCount !== 1 ? "s" : ""} played
              </p>

              {/* Score comparison with animated count-up */}
              <div className="space-y-2.5 mb-6">
                {teamNames.map((name, i) => {
                  const isWinner = i === winner;
                  return (
                    <motion.div
                      key={i}
                      className="flex items-center justify-between px-4 py-3 rounded-xl"
                      style={
                        isWinner && !tied
                          ? {
                              background: "linear-gradient(135deg, rgba(249,115,22,0.1), rgba(234,108,16,0.06))",
                              border: "2px solid rgba(249,115,22,0.32)",
                            }
                          : {
                              background: "#F9FAFB",
                              border: "1px solid #E5E7EB",
                            }
                      }
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                    >
                      <div className="flex items-center gap-2">
                        {isWinner && !tied && (
                          <span className="text-lg leading-none">👑</span>
                        )}
                        <span className="font-semibold text-sm" style={{ color: "#111827" }}>
                          {name}
                        </span>
                      </div>
                      <span
                        className="text-2xl font-black tabular-nums"
                        style={{ color: isWinner && !tied ? "#F97316" : "#374151" }}
                      >
                        <AnimatedFinalScore target={cumulativeScores[i]} />
                      </span>
                    </motion.div>
                  );
                })}
              </div>

              {/* New game button */}
              <motion.button
                type="button"
                onClick={() => setPendingNewGame(true)}
                className="w-full h-14 rounded-xl text-white text-lg font-bold tracking-tight transition-all btn-tactile"
                style={{
                  background: "linear-gradient(135deg, #F97316 0%, #EA6C10 100%)",
                  boxShadow: "0 6px 20px rgba(249,115,22,0.38)",
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.52 }}
              >
                New Game
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation modal */}
      <AnimatePresence>
        {pendingNewGame && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center p-5 z-50"
            style={{ background: "rgba(0,0,0,0.55)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-xs rounded-2xl p-6"
              style={{ background: "white" }}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <p className="text-center font-bold text-lg mb-1" style={{ color: "#111827" }}>
                Start a new game?
              </p>
              <p className="text-center text-sm mb-5" style={{ color: "#6B7280" }}>
                Current game will be cleared.
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
                  onClick={onNewGame}
                  className="flex-1 h-12 rounded-xl font-semibold text-white transition-all btn-tactile"
                  style={{ background: "#F97316" }}
                >
                  New Game
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
