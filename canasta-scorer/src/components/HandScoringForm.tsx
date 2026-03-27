"use client";

import { HandEntry, GoingOut } from "@/lib/types";
import { calculateHandScore } from "@/lib/scoring";
import { Stepper } from "@/components/Stepper";

interface HandScoringFormProps {
  teamName: string;
  teamIndex: 0 | 1;
  entry: HandEntry;
  otherTeamWentOut: boolean;
  onChange: (entry: HandEntry) => void;
}

function SectionHeader({
  icon,
  title,
  color,
}: {
  icon: string;
  title: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-lg leading-none">{icon}</span>
      <span
        className="text-xs font-bold uppercase tracking-widest"
        style={{ color }}
      >
        {title}
      </span>
      <div className="flex-1 h-px" style={{ background: `${color}22` }} />
    </div>
  );
}

export function HandScoringForm({
  teamName,
  entry,
  otherTeamWentOut,
  onChange,
}: HandScoringFormProps) {
  const update = (patch: Partial<HandEntry>) =>
    onChange({ ...entry, ...patch });

  const handScore = calculateHandScore(entry);
  const isPositive = handScore >= 0;

  const canastasValid =
    entry.naturalCanastas + entry.mixedCanastas > 0 || entry.goingOut === "none";

  return (
    <div className="space-y-5">
      {/* Team name + score pill */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold" style={{ color: "#111827" }}>
          {teamName}
        </h3>
        <div
          className="text-sm font-bold tabular-nums px-3 py-1.5 rounded-full"
          style={
            isPositive
              ? {
                  background: "rgba(22,163,74,0.12)",
                  color: "#15803d",
                  border: "1px solid rgba(22,163,74,0.2)",
                }
              : {
                  background: "rgba(220,38,38,0.1)",
                  color: "#dc2626",
                  border: "1px solid rgba(220,38,38,0.2)",
                }
          }
        >
          {isPositive ? "+" : ""}
          {handScore.toLocaleString()}
        </div>
      </div>

      {/* SECTION 1: Melded Cards */}
      <div>
        <SectionHeader icon="🃏" title="Melded Cards" color="#6366F1" />
        <div
          className="rounded-xl p-4"
          style={{ background: "rgba(99,102,241,0.04)", border: "1px solid rgba(99,102,241,0.1)" }}
        >
          <label className="text-sm font-medium block mb-1" style={{ color: "#374151" }}>
            Card point total
          </label>
          <p className="text-xs mb-2" style={{ color: "#9CA3AF" }}>
            Joker 50 · 2/A 20 · K–8 10 · 7–4 or ♣♠3 five pts
          </p>
          <input
            type="number"
            inputMode="numeric"
            value={entry.meldedPoints || ""}
            onChange={(e) =>
              update({ meldedPoints: Math.max(0, Number(e.target.value) || 0) })
            }
            placeholder="0"
            className="w-full h-14 rounded-xl border text-2xl font-bold text-center tabular-nums outline-none transition-all"
            style={{
              borderColor: "rgba(99,102,241,0.2)",
              background: "white",
              color: "#111827",
            }}
            min={0}
          />
        </div>
      </div>

      {/* SECTION 2: Canastas */}
      <div>
        <SectionHeader icon="✨" title="Canastas" color="#D97706" />
        <div className="space-y-3">
          {/* Natural — gold shimmer */}
          <div className="natural-canasta-card rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base leading-none">♛</span>
                  <span className="text-sm font-bold" style={{ color: "#78350F" }}>
                    Natural
                  </span>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(245,158,11,0.22)", color: "#92400E" }}
                  >
                    +500 each
                  </span>
                </div>
                <p className="text-xs mt-0.5 pl-6" style={{ color: "#B45309" }}>
                  No wild cards
                </p>
              </div>
              <Stepper
                value={entry.naturalCanastas}
                onChange={(v) => update({ naturalCanastas: v })}
                max={10}
                variant="gold"
              />
            </div>
          </div>

          {/* Mixed — silver */}
          <div className="mixed-canasta-card rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base leading-none" style={{ color: "#64748B" }}>◆</span>
                  <span className="text-sm font-semibold" style={{ color: "#334155" }}>
                    Mixed
                  </span>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(100,116,139,0.15)", color: "#475569" }}
                  >
                    +300 each
                  </span>
                </div>
                <p className="text-xs mt-0.5 pl-6" style={{ color: "#64748B" }}>
                  With wild cards
                </p>
              </div>
              <Stepper
                value={entry.mixedCanastas}
                onChange={(v) => update({ mixedCanastas: v })}
                max={10}
                variant="silver"
              />
            </div>
          </div>
        </div>
        {!canastasValid && entry.goingOut !== "none" && (
          <p className="text-xs mt-2" style={{ color: "#D97706" }}>
            ⚠ Need at least 1 canasta to go out
          </p>
        )}
      </div>

      {/* SECTION 3: Special Bonuses — Red 3s */}
      <div>
        <SectionHeader icon="🃏" title="Red Threes" color="#DC2626" />
        <div className="red-three-card rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold" style={{ color: "#991B1B" }}>
                Count
              </span>
              <p className="text-xs mt-0.5" style={{ color: "#DC2626", opacity: 0.7 }}>
                1=100 · 2=200 · 3=300 · 4=800
              </p>
            </div>
            <Stepper
              value={entry.redThrees}
              onChange={(v) => update({ redThrees: v })}
              max={4}
            />
          </div>

          {entry.redThrees > 0 && (
            <button
              type="button"
              onClick={() => update({ hasNoMelds: !entry.hasNoMelds })}
              className="w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left"
              style={{
                background: entry.hasNoMelds
                  ? "rgba(220,38,38,0.1)"
                  : "rgba(220,38,38,0.04)",
                border: `1px solid ${entry.hasNoMelds ? "rgba(220,38,38,0.3)" : "rgba(220,38,38,0.12)"}`,
              }}
            >
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-all"
                style={{
                  background: entry.hasNoMelds ? "#DC2626" : "white",
                  border: `2px solid ${entry.hasNoMelds ? "#DC2626" : "#D1D5DB"}`,
                }}
              >
                {entry.hasNoMelds && (
                  <span className="text-white text-sm font-bold leading-none">✓</span>
                )}
              </div>
              <div>
                <div className="text-sm font-semibold" style={{ color: "#991B1B" }}>
                  No melds made
                </div>
                <div className="text-xs" style={{ color: "#DC2626", opacity: 0.8 }}>
                  Red 3s become penalties
                </div>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* SECTION 4: Going Out */}
      <div>
        <SectionHeader icon="🚪" title="Going Out" color="#F97316" />
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { value: "none", label: "No", sub: "" },
              { value: "normal", label: "Yes", sub: "+100" },
              { value: "concealed", label: "Concealed", sub: "+200" },
            ] as { value: GoingOut; label: string; sub: string }[]
          ).map(({ value, label, sub }) => {
            const isSelected = entry.goingOut === value;
            const disabled = value !== "none" && otherTeamWentOut;
            return (
              <button
                key={value}
                type="button"
                disabled={disabled}
                onClick={() => update({ goingOut: value })}
                className="h-16 rounded-xl border-2 text-sm font-semibold transition-all btn-tactile flex flex-col items-center justify-center gap-0.5"
                style={
                  isSelected
                    ? {
                        background:
                          value === "concealed"
                            ? "linear-gradient(135deg, #F97316, #EA6C10)"
                            : value === "normal"
                            ? "rgba(249,115,22,0.1)"
                            : "rgba(99,102,241,0.08)",
                        borderColor:
                          value === "concealed"
                            ? "#F97316"
                            : value === "normal"
                            ? "#F97316"
                            : "#6366F1",
                        color:
                          value === "concealed"
                            ? "white"
                            : value === "normal"
                            ? "#C2410C"
                            : "#4338CA",
                      }
                    : disabled
                    ? {
                        background: "#F9FAFB",
                        borderColor: "#E5E7EB",
                        color: "#D1D5DB",
                        cursor: "not-allowed",
                      }
                    : {
                        background: "white",
                        borderColor: "rgba(99,102,241,0.15)",
                        color: "#374151",
                      }
                }
              >
                <span>{label}</span>
                {sub && (
                  <span
                    className="text-xs font-bold"
                    style={{
                      color: isSelected && value === "concealed" ? "rgba(255,255,255,0.85)" : "#F97316",
                    }}
                  >
                    {sub}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Unmelded penalty */}
      <div>
        <SectionHeader icon="📉" title="Unmelded Penalty" color="#6B7280" />
        <div
          className="rounded-xl p-4"
          style={{
            background: "rgba(107,114,128,0.05)",
            border: "1px solid rgba(107,114,128,0.15)",
          }}
        >
          <p className="text-xs mb-2" style={{ color: "#9CA3AF" }}>
            Point value of cards still in hand — will be subtracted
          </p>
          <input
            type="number"
            inputMode="numeric"
            value={entry.unmeledPoints || ""}
            onChange={(e) =>
              update({
                unmeledPoints: Math.max(0, Number(e.target.value) || 0),
              })
            }
            placeholder="0"
            className="w-full h-14 rounded-xl border text-2xl font-bold text-center tabular-nums outline-none transition-all"
            style={{
              borderColor: "rgba(107,114,128,0.2)",
              background: "white",
              color: "#DC2626",
            }}
            min={0}
          />
        </div>
      </div>
    </div>
  );
}
