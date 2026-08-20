import React from "react";
import { Loader2 } from "lucide-react";

export default function Spinner({
  size = "md",
  className = "",
  label = "Loading...",
}) {
  const sizeStyles = {
    sm: "w-4 h-4",
    md: "w-7 h-7",
    lg: "w-10 h-10",
  };

  return (
    <div className={`flex flex-col items-center justify-center p-6 text-slate-500 ${className}`}>
      <Loader2 className={`animate-spin text-indigo-600 ${sizeStyles[size] || sizeStyles.md}`} />
      {label && <p className="mt-2.5 text-xs font-medium text-slate-500">{label}</p>}
    </div>
  );
}
