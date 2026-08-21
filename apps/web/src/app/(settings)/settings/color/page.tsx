"use client";

import { useAccent } from "@/components/providers/accent-provider";
import { ACCENT_SWATCH, ACCENTS } from "@/lib/accent";
import { cn } from "@/lib/utils";

export default function ColorSettingsPage() {
  const { accent, setAccent } = useAccent();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">Color</h1>

      <div className="grid grid-cols-3 gap-3">
        {ACCENTS.map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => setAccent(a)}
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-sm font-medium capitalize text-foreground transition-colors hover:bg-muted",
              accent === a && "border-ring ring-3 ring-ring/50",
            )}
          >
            <span
              className="size-5 rounded-full border border-border"
              style={{ background: ACCENT_SWATCH[a] ?? "var(--foreground)" }}
            />
            {a}
            {accent === a && <span className="text-xs text-muted-foreground">✓ Selected</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
