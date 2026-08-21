"use client";

import type { ReactNode } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// A handful of affordances in the refs (row "···" menus, "+ Add" rows, attach/document icons)
// aren't wired to real features yet. Rendering them as real, keyboard-reachable buttons with an
// honest "coming soon" toast beats either a dead-looking icon or a fake, feature-less menu.
export function StubAction({
  label,
  icon,
  children,
  className,
}: {
  label: string;
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={children ? undefined : label}
      title={label}
      onClick={() => toast(`${label} is coming soon.`)}
      className={cn(
        "inline-flex items-center gap-1 rounded outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        className,
      )}
    >
      {icon}
      {children}
    </button>
  );
}
