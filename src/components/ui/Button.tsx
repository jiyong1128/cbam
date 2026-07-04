"use client";

import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "emerald";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-navy-900 text-white hover:bg-navy-800 border border-navy-900",
  secondary:
    "bg-white text-navy-900 border border-slate-300 hover:bg-slate-50",
  outline:
    "border border-white/40 text-white hover:bg-white/10",
  ghost: "text-navy-600 hover:bg-navy-50",
  emerald:
    "bg-emerald-600 text-white hover:bg-emerald-500 border border-emerald-500",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-3.5 py-2 text-xs",
  md: "px-5 py-2.5 text-xs",
  lg: "px-6 py-3 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-none font-semibold uppercase tracking-[0.08em] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-navy-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
