"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Collapsed icon ⇄ 290px input with a ⌘F hint (plan §8) — expands on click or the ⌘F shortcut. */
export function SearchBox() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [open, setOpen] = useState(initialQuery.length > 0);
  const [value, setValue] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        setOpen(true);
        requestAnimationFrame(() => inputRef.current?.focus());
      }
      if (e.key === "Escape" && open && !value) {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, value]);

  function commit(next: string) {
    const url = new URL(window.location.href);
    if (next) url.searchParams.set("q", next);
    else url.searchParams.delete("q");
    router.push(url.pathname + url.search);
  }

  if (!open) {
    return (
      <Button variant="outline" size="icon" onClick={() => setOpen(true)} aria-label="Search">
        <Search className="size-3.5" />
      </Button>
    );
  }

  return (
    <div
      className={cn(
        "flex h-8 w-[290px] items-center gap-1.5 rounded-lg border border-border-control bg-background px-2.5",
      )}
    >
      <Search className="size-3.5 shrink-0 text-muted-foreground-faint" />
      <input
        ref={inputRef}
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit(value);
          if (e.key === "Escape") {
            setValue("");
            commit("");
            setOpen(false);
          }
        }}
        onBlur={() => commit(value)}
        placeholder="Search"
        className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground-placeholder"
      />
      <kbd className="shrink-0 rounded border border-border-control px-1 font-mono text-[10px] text-muted-foreground-faint">
        ⌘F
      </kbd>
    </div>
  );
}
