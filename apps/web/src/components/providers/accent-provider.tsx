"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { type Accent } from "@/lib/accent";

const ACCENT_COOKIE = "accent";

interface AccentContextValue {
  accent: Accent;
  setAccent: (accent: Accent) => void;
}

const AccentContext = createContext<AccentContextValue | null>(null);

export function AccentProvider({ children, initialAccent }: { children: ReactNode; initialAccent: Accent }) {
  const [accent, setAccentState] = useState<Accent>(initialAccent);

  useEffect(() => {
    document.documentElement.setAttribute("data-accent", accent);
  }, [accent]);

  // Independent of next-themes' light/dark cookie (§3.2) — mirrored here so SSR paints the
  // right accent on first load, the same way the theme cookie does for light/dark.
  const setAccent = useCallback((next: Accent) => {
    setAccentState(next);
    document.cookie = `${ACCENT_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
  }, []);

  return <AccentContext.Provider value={{ accent, setAccent }}>{children}</AccentContext.Provider>;
}

export function useAccent() {
  const ctx = useContext(AccentContext);
  if (!ctx) throw new Error("useAccent must be used within an AccentProvider");
  return ctx;
}
