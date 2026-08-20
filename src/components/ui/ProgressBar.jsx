import React from "react";
import { cn } from "../../utils/cn";

export default function ProgressBar({
  progress = 0,
  size = "md",
  showLabel = true,
  color = "indigo",
  className = "",
}) {
  const clamped = Math.min(100, Math.max(0, Math.round(progress)));

  const heightStyles = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  const colorStyles = {
    indigo: "bg-indigo-600",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
  };

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-semibold text-slate-600 mb-1.5">
          <span>Progress</span>
          <span className="font-bold text-slate-800">{clamped}%</span>
        </div>
      )}
      <div className={cn("w-full bg-slate-100 rounded-full overflow-hidden", heightStyles[size] || heightStyles.md)}>
        <div
          className={cn(
            heightStyles[size] || heightStyles.md,
            colorStyles[color] || colorStyles.indigo,
            "rounded-full transition-all duration-500 ease-out"
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

