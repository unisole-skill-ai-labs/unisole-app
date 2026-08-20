import React from "react";
import { cn } from "../../utils/cn";

export default function Badge({
  children,
  variant = "indigo",
  size = "md",
  className = "",
}) {
  const sizeStyles = {
    sm: "px-2 py-0.5 text-[11px] font-medium rounded-md",
    md: "px-2.5 py-1 text-xs font-semibold rounded-lg",
    lg: "px-3 py-1.5 text-sm font-semibold rounded-lg",
  };

  const variantStyles = {
    indigo: "bg-indigo-50 text-indigo-700 border border-indigo-100",
    emerald: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    amber: "bg-amber-50 text-amber-700 border border-amber-100",
    rose: "bg-rose-50 text-rose-700 border border-rose-100",
    slate: "bg-slate-100 text-slate-700 border border-slate-200",
    purple: "bg-purple-50 text-purple-700 border border-purple-100",
    sky: "bg-sky-50 text-sky-700 border border-sky-100",
    glass: "bg-black/35 backdrop-blur-md text-white border border-white/20 shadow-xs",
    dark: "bg-slate-900/60 backdrop-blur-md text-white border border-white/20 shadow-xs",
    white: "bg-white text-slate-900 border border-slate-200 shadow-xs",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-medium tracking-wide",
        sizeStyles[size] || sizeStyles.md,
        variantStyles[variant] || variantStyles.indigo,
        className
      )}
    >
      {children}
    </span>
  );
}

