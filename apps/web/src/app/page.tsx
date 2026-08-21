"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Triangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccent } from "@/components/providers/accent-provider";
import { ACCENTS } from "@/lib/accent";

const PRIORITY_SWATCHES = [
  ["Urgent", "bg-priority-urgent"],
  ["High", "bg-priority-high"],
  ["Medium", "bg-priority-medium"],
  ["Low", "bg-priority-low"],
] as const;

export default function Home() {
  const { theme, setTheme } = useTheme();
  const { accent, setAccent } = useAccent();

  return (
    <main className="flex min-h-full flex-col gap-8 bg-background p-10 text-foreground">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-semibold">
            <Triangle className="size-3.5" fill="currentColor" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Pyramid</span>
        </div>
        <Button variant="outline" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Color mode</h2>
        <div className="flex flex-wrap gap-2">
          {ACCENTS.map((a) => (
            <button
              key={a}
              onClick={() => setAccent(a)}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs capitalize"
              data-accent={a}
              style={{ borderColor: accent === a ? "var(--ring)" : undefined }}
            >
              <span className="size-3 rounded-full bg-primary" style={{ background: `var(--primary)` }} />
              {a}
              {accent === a && " ✓"}
            </button>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Buttons</h2>
        <div className="flex flex-wrap gap-2">
          <Button>Primary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Priority</h2>
        <div className="flex flex-wrap gap-4">
          {PRIORITY_SWATCHES.map(([label, cls]) => (
            <div key={label} className="flex items-center gap-2 text-sm">
              <span className={`size-2.5 rounded-full ${cls}`} />
              {label}
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Due badge</h2>
        <div
          className="inline-flex w-fit items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium"
          style={{ background: "var(--due-bg)", borderColor: "var(--due-border)", color: "var(--due-fg)" }}
        >
          31 Jul
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Avatar gradient</h2>
        <div className="size-8 rounded-full" style={{ backgroundImage: "var(--gradient-avatar)" }} />
      </section>
    </main>
  );
}
