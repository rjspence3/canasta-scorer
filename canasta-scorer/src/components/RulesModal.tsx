"use client";

import {
  HouseRules,
  DEFAULT_HOUSE_RULES,
  HOUSE_RULES_LABELS,
  formatRuleValue,
  isDefaultRules,
} from "@/lib/houseRules";

interface RulesModalProps {
  rules: HouseRules;
  onClose: () => void;
}

const RULES_ORDER: (keyof HouseRules)[] = [
  "targetScore",
  "naturalCanastaBonus",
  "mixedCanastaBonus",
  "goingOutBonus",
  "goingOutConcealedBonus",
  "singleRed3Value",
  "allFourRed3sBonus",
  "initialMeldScoreNeg",
  "initialMeldScore0to1499",
  "initialMeldScore1500to2999",
  "initialMeldScore3000plus",
  "black3Penalty",
  "maxWildsPerMeld",
];

export function RulesModal({ rules, onClose }: RulesModalProps) {
  const isDefault = isDefaultRules(rules);

  return (
    <div
      className="fixed inset-0 flex items-end justify-center z-50"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-t-2xl p-5 space-y-4"
        style={{
          background: "white",
          maxHeight: "80vh",
          overflowY: "auto",
          boxShadow: "0 -8px 32px rgba(0,0,0,0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold" style={{ color: "#111827" }}>
            📋 House Rules
          </h3>
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{
              background: isDefault
                ? "rgba(107,114,128,0.1)"
                : "rgba(249,115,22,0.12)",
              color: isDefault ? "#6B7280" : "#EA6C10",
            }}
          >
            {isDefault ? "Standard" : "Custom"}
          </span>
        </div>

        <div className="space-y-1.5">
          {RULES_ORDER.map((key) => {
            const value = rules[key];
            const isModified = value !== DEFAULT_HOUSE_RULES[key];
            return (
              <div
                key={key}
                className="flex items-center justify-between py-2 px-3 rounded-lg"
                style={{
                  background: isModified
                    ? "rgba(249,115,22,0.06)"
                    : "rgba(107,114,128,0.04)",
                  border: `1px solid ${
                    isModified
                      ? "rgba(249,115,22,0.15)"
                      : "rgba(107,114,128,0.1)"
                  }`,
                }}
              >
                <span className="text-sm" style={{ color: "#374151" }}>
                  {HOUSE_RULES_LABELS[key]}
                </span>
                <span
                  className="text-sm font-bold tabular-nums"
                  style={{ color: isModified ? "#F97316" : "#6366F1" }}
                >
                  {formatRuleValue(key, value)}
                </span>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full h-12 rounded-xl font-semibold border transition-all btn-tactile"
          style={{ borderColor: "#E5E7EB", color: "#374151" }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
