"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/tools/cbam-calculator", label: "비용 계산기" },
  { href: "/pricing", label: "요금제" },
  { href: "/consulting", label: "컨설팅" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 border-b transition-colors duration-300",
        scrolled ? "bg-white/95 border-slate-200 backdrop-blur-md" : "bg-navy-950/80 border-white/15 backdrop-blur-sm"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded border border-emerald-500 bg-emerald-500 text-xs font-bold tracking-wide text-white">
            CB
          </div>
          <span
            className={cn(
              "text-sm font-semibold uppercase tracking-[0.12em] transition-colors",
              scrolled ? "text-navy-900" : "text-white"
            )}
          >
            CBAM Korea
          </span>
        </Link>

        <div className="hidden items-center gap-0.5 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-2 text-xs font-semibold uppercase tracking-[0.09em] transition-colors",
                scrolled ? "text-slate-700 hover:bg-slate-100 hover:text-navy-900" : "text-white/80 hover:bg-white/10 hover:text-white"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/tools/cbam-calculator">
            <Button variant="emerald" size="sm">무료 진단 시작</Button>
          </Link>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={cn("p-2 transition-colors lg:hidden", scrolled ? "text-slate-700" : "text-white")}
          aria-label="menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white shadow-lg lg:hidden">
          <div className="space-y-1 px-4 py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-slate-700 hover:bg-slate-100"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/tools/cbam-calculator" onClick={() => setMobileOpen(false)} className="block pt-3">
              <Button variant="emerald" size="sm" className="w-full">무료 진단 시작</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
