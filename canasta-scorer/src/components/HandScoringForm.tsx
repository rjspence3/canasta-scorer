"use client";

import { HandEntry, GoingOut } from "@/lib/types";
import { calculateHandScore } from "@/lib/scoring";
import { Stepper } from "@/components/Stepper";
import { Input } from "@/components/ui/input";

interface HandScoringFormProps {
  teamName: string;
  teamIndex: 0 | 1;
  entry: HandEntry;
  otherTeamWentOut: boolean;
  onChange: (entry: HandEntry) => void;
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-800">{teamName}</h3>
        <div
          className={`text-lg font-bold tabular-nums px-3 py-1 rounded-full ${
            isPositive
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-700"
          }`}
        >
          {isPositive ? "+" : ""}
          {handScore.toLocaleString()}
        </div>
      </div>

      {/* Melded points */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">
          Melded card points
        </label>
        <p className="text-xs text-gray-400">
          Sum of all cards laid on table (Joker=50, 2/A=20, K-8=10, 7-4=5)
        </p>
        <Input
          type="number"
          inputMode="numeric"
          value={entry.meldedPoints || ""}
          onChange={(e) =>
            update({ meldedPoints: Math.max(0, Number(e.target.value) || 0) })
          }
          placeholder="0"
          className="text-lg font-bold"
          min={0}
        />
      </div>

      {/* Canastas */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Canastas</label>
        <div className="space-y-2 bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium">Natural</span>
              <span className="text-xs text-gray-500 ml-1">(+500 each)</span>
            </div>
            <Stepper
              value={entry.naturalCanastas}
              onChange={(v) => update({ naturalCanastas: v })}
              max={10}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium">Mixed</span>
              <span className="text-xs text-gray-500 ml-1">(+300 each)</span>
            </div>
            <Stepper
              value={entry.mixedCanastas}
              onChange={(v) => update({ mixedCanastas: v })}
              max={10}
            />
          </div>
        </div>
        {!canastasValid && entry.goingOut !== "none" && (
          <p className="text-xs text-amber-600">
            ⚠ Team needs at least 1 canasta to go out
          </p>
        )}
      </div>

      {/* Red 3s */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Red threes</label>
        <div className="bg-gray-50 rounded-lg p-3 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium">Count</span>
              <span className="text-xs text-gray-500 ml-1">
                (1=100, 2=200, 3=300, 4=800)
              </span>
            </div>
            <Stepper
              value={entry.redThrees}
              onChange={(v) => update({ redThrees: v })}
              max={4}
            />
          </div>
          {entry.redThrees > 0 && (
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                role="checkbox"
                aria-checked={entry.hasNoMelds}
                tabIndex={0}
                onClick={() => update({ hasNoMelds: !entry.hasNoMelds })}
                onKeyDown={(e) => {
                  if (e.key === " " || e.key === "Enter")
                    update({ hasNoMelds: !entry.hasNoMelds });
                }}
                className={`w-6 h-6 rounded border-2 flex items-center justify-center cursor-pointer shrink-0 transition-colors ${
                  entry.hasNoMelds
                    ? "bg-red-500 border-red-500"
                    : "bg-white border-gray-300"
                }`}
              >
                {entry.hasNoMelds && (
                  <span className="text-white text-sm font-bold">✓</span>
                )}
              </div>
              <span className="text-sm">
                No melds made{" "}
                <span className="text-red-600 font-medium">
                  (red 3s become penalties)
                </span>
              </span>
            </label>
          )}
        </div>
      </div>

      {/* Going out */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Going out</label>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { value: "none", label: "No", sub: "" },
              { value: "normal", label: "Yes", sub: "+100" },
              { value: "concealed", label: "Concealed", sub: "+200" },
            ] as { value: GoingOut; label: string; sub: string }[]
          ).map(({ value, label, sub }) => {
            const disabled = value !== "none" && otherTeamWentOut;
            return (
              <button
                key={value}
                type="button"
                disabled={disabled}
                onClick={() => update({ goingOut: value })}
                className={`h-14 rounded-lg border-2 text-sm font-medium transition-colors flex flex-col items-center justify-center gap-0.5 ${
                  entry.goingOut === value
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : disabled
                    ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed"
                    : "border-gray-200 bg-white hover:border-gray-300 text-gray-700"
                }`}
              >
                <span>{label}</span>
                {sub && (
                  <span
                    className={`text-xs font-bold ${
                      entry.goingOut === value
                        ? "text-blue-600"
                        : "text-green-600"
                    }`}
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
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">
          Unmelded card penalty
        </label>
        <p className="text-xs text-gray-400">
          Point value of cards still in hand (will be subtracted)
        </p>
        <Input
          type="number"
          inputMode="numeric"
          value={entry.unmeledPoints || ""}
          onChange={(e) =>
            update({
              unmeledPoints: Math.max(0, Number(e.target.value) || 0),
            })
          }
          placeholder="0"
          className="text-lg font-bold"
          min={0}
        />
      </div>
    </div>
  );
}
