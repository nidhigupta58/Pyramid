"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const THEMES = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
] as const;

const noopSubscribe = () => () => {};

export default function ThemeSettingsPage() {
  const { theme, setTheme } = useTheme();
  // next-themes reports `theme` as undefined until mounted, to avoid a client/server mismatch —
  // mirror that here rather than letting the selected-state ring flip post-hydration.
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">Theme</h1>

      <div className="flex gap-3">
        {THEMES.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            className={cn(
              "flex w-32 flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-sm font-medium text-foreground transition-colors hover:bg-muted",
              mounted && theme === value && "border-ring ring-3 ring-ring/50",
            )}
          >
            <Icon className="size-5" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
