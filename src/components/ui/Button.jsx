import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../utils/cn";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon: Icon,
  className = "",
  type = "button",
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs font-semibold gap-1.5 min-h-[36px]",
    md: "px-4 py-2.5 text-sm font-semibold gap-2 min-h-[44px]",
    lg: "px-5 py-3 text-base font-bold gap-2.5 min-h-[48px]",
    icon: "p-2.5 min-h-[40px] min-w-[40px] rounded-xl",
  };

  const variantStyles = {
    primary:
      "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200 focus:ring-indigo-500",
    secondary:
      "bg-slate-900 hover:bg-slate-800 text-white shadow-sm focus:ring-slate-700",
    outline:
      "border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 focus:ring-slate-400",
    ghost:
      "bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 focus:ring-slate-300",
    glass:
      "border border-white/40 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md focus:ring-white/40 shadow-sm",
    white:
      "bg-white hover:bg-slate-100 text-indigo-900 font-bold shadow-lg focus:ring-indigo-500",
    danger:
      "bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-200 focus:ring-rose-500",
    success:
      "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-200 focus:ring-emerald-500",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        baseStyles,
        sizeStyles[size] || sizeStyles.md,
        variantStyles[variant] || variantStyles.primary,
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      {children}
    </button>
  );
}

