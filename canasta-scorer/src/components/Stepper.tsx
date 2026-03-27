"use client";

import { cn } from "@/lib/utils";

interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
  className?: string;
}

export function Stepper({
  value,
  onChange,
  min = 0,
  max = 99,
  label,
  className,
}: StepperProps) {
  const decrement = () => {
    if (value > min) onChange(value - 1);
  };
  const increment = () => {
    if (value < max) onChange(value + 1);
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {label && (
        <span className="text-sm text-muted-foreground w-28 shrink-0">
          {label}
        </span>
      )}
      <div className="flex items-center border border-input rounded-md overflow-hidden">
        <button
          type="button"
          onClick={decrement}
          disabled={value <= min}
          className="w-11 h-11 flex items-center justify-center text-xl font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 active:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <span className="w-10 text-center text-lg font-bold tabular-nums select-none">
          {value}
        </span>
        <button
          type="button"
          onClick={increment}
          disabled={value >= max}
          className="w-11 h-11 flex items-center justify-center text-xl font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 active:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}
