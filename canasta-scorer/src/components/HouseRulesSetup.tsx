"use client";

import { useState } from "react";
import {
  HouseRules,
  DEFAULT_HOUSE_RULES,
  HOUSE_RULES_OPTIONS,
  HOUSE_RULES_LABELS,
  isDefaultRules,
} from "@/lib/houseRules";

interface HouseRulesSetupProps {
  rules: HouseRules;
  onChange: (rules: HouseRules) => void;
}

function formatOption(key: keyof HouseRules, value: number): string {
  if (key === "targetScore") return value.toLocaleString();
  if (key === "maxWildsPerMeld") return `${value} max`;
  return `${value}`;
}

export function HouseRulesSetup({ rules, onChange }: HouseRulesSetupProps) {
  const [expanded, setExpanded] = useState(false);
  const isDefault = isDefaultRules(rules);

  const update = (key: keyof HouseRules, value: number) => {
    onChange({ ...rules, [key]: value });
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between h-12 px-4 rounded-xl border transition-all"
        style={{
          background: "white",
          borderColor: isDefault
            ? "rgba(99,102,241,0.15)"
            : "rgba(249,115,22,0.35)",
          color: isDefault ? "#6B7280" : "#EA6C10",
        }}
      >
        <span className="text-sm font-semibold">
          ⚙️ House Rules —{" "}
          <span
            className="font-medium"
            style={{ color: isDefault ? "#9CA3AF" : "#F97316" }}
          >
            {isDefault ? "Standard" : "Custom"}
          </span>
        </span>
        <span className="text-xs" style={{ color: "#9CA3AF" }}>
          {expanded ? "▲" : "▼"}
        </span>
      </button>

      {expanded && (
        <div
          className="mt-2 rounded-xl border p-4 space-y-4"
          style={{
            borderColor: "rgba(99,102,241,0.12)",
            background: "rgba(248,249,252,0.8)",
          }}
        >
          {(Object.keys(HOUSE_RULES_OPTIONS) as (keyof HouseRules)[]).map(
            (key) => {
              const options = HOUSE_RULES_OPTIONS[key];
              const current = rules[key];
              const label = HOUSE_RULES_LABELS[key];
              return (
                <div key={key}>
                  <div
                    className="text-xs font-medium mb-2"
                    style={{ color: "#374151" }}
                  >
                    {label}
                  </div>
                  <div className="flex gap-2">
                    {options.map((opt) => {
                      const isSelected = current === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => update(key, opt)}
                          className="flex-1 h-10 rounded-lg text-xs font-semibold transition-all btn-tactile"
                          style={
                            isSelected
                              ? {
                                  background: "#6366F1",
                                  color: "white",
                                  border: "1px solid #6366F1",
                                }
                              : {
                                  background: "white",
                                  color: "#374151",
                                  border: "1px solid rgba(99,102,241,0.2)",
                                }
                          }
                        >
                          {formatOption(key, opt)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            }
          )}

          <button
            type="button"
            onClick={() => onChange(DEFAULT_HOUSE_RULES)}
            className="w-full h-10 rounded-lg text-sm font-semibold border transition-all btn-tactile"
            style={{
              borderColor: "rgba(107,114,128,0.2)",
              color: "#6B7280",
              background: "white",
            }}
          >
            ↺ Reset to standard
          </button>
        </div>
      )}
    </div>
  );
}
