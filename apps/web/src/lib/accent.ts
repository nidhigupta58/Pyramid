// Mirrors packages/contracts' accentEnum (lowercased for the data-accent attribute / CSS selectors).
export const ACCENTS = ["amber", "blue", "pink", "rose", "emerald", "black"] as const;
export type Accent = (typeof ACCENTS)[number];

export const DEFAULT_ACCENT: Accent = "blue";

export function isAccent(value: string | undefined): value is Accent {
  return !!value && (ACCENTS as readonly string[]).includes(value);
}

// "Black" is the monochrome accent (no swatch dot in the refs) — everything else gets one.
export const ACCENT_SWATCH: Partial<Record<Accent, string>> = {
  amber: "#f59e0b",
  blue: "#7c3aed",
  pink: "#ec4899",
  rose: "#e11d48",
  emerald: "#10b981",
};
