// Mirrors packages/contracts' accentEnum (lowercased for the data-accent attribute / CSS selectors).
export const ACCENTS = ["amber", "blue", "pink", "rose", "emerald", "black"] as const;
export type Accent = (typeof ACCENTS)[number];

export const DEFAULT_ACCENT: Accent = "blue";

export function isAccent(value: string | undefined): value is Accent {
  return !!value && (ACCENTS as readonly string[]).includes(value);
}
