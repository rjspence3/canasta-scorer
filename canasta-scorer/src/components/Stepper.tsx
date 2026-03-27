"use client";

import { cn } from "@/lib/utils";

interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
  className?: string;
  variant?: "default" | "gold" | "silver";
}

const VARIANT_STYLES = {
  default: {
    btn: "bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700",
    value: "text-gray-900",
    border: "border-gray-200",
  },
  gold: {
    btn: "bg-amber-50 hover:bg-amber-100 active:bg-amber-200 text-amber-700",
    value: "text-amber-800",
    border: "border-amber-200",
  },
  silver: {
    btn: "bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-600",
    value: "text-slate-700",
    border: "border-slate-200",
  },
};

export function Stepper({
  value,
  onChange,
  min = 0,
  max = 99,
  label,
  className,
  variant = "default",
}: StepperProps) {
  const styles = VARIANT_STYLES[variant];

  const decrement = () => {
    if (value > min) onChange(value - 1);
  };
  const increment = () => {
    if (value < max) onChange(value + 1);
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {label && (
        <span className="text-sm text-gray-500 shrink-0">{label}</span>
      )}
      <div
        className={cn(
          "flex items-center border rounded-xl overflow-hidden shadow-sm",
          styles.border
        )}
      >
        <button
          type="button"
          onClick={decrement}
          disabled={value <= min}
          className={cn(
            "w-14 h-14 flex items-center justify-center text-2xl font-bold transition-all btn-tactile select-none",
            styles.btn,
            "disabled:opacity-25 disabled:cursor-not-allowed"
          )}
          aria-label={`Decrease${label ? " " + label : ""}`}
        >
          −
        </button>
        <span
          className={cn(
            "w-12 text-center text-2xl font-bold tabular-nums select-none",
            styles.value
          )}
        >
          {value}
        </span>
        <button
          type="button"
          onClick={increment}
          disabled={value >= max}
          className={cn(
            "w-14 h-14 flex items-center justify-center text-2xl font-bold transition-all btn-tactile select-none",
            styles.btn,
            "disabled:opacity-25 disabled:cursor-not-allowed"
          )}
          aria-label={`Increase${label ? " " + label : ""}`}
        >
          +
        </button>
      </div>
    </div>
  );
}
