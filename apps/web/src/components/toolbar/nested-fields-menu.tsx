"use client";

import { Calendar, Check, ChevronRight, Circle, Flag, LayoutGrid, SignalHigh, Tag, User, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Priority } from "@/lib/types";

const PRIORITY_OPTIONS: { label: string; value: Priority }[] = [
  { label: "No Priority", value: "NO_PRIORITY" },
  { label: "Urgent", value: "URGENT" },
  { label: "High", value: "HIGH" },
  { label: "Medium", value: "MEDIUM" },
  { label: "Low", value: "LOW" },
];

const ROWS = [
  { label: "Status", icon: Circle },
  { label: "Priority", icon: SignalHigh },
  { label: "Members", icon: User },
  { label: "Due Date", icon: Calendar },
  { label: "Teams", icon: Flag },
  { label: "Labels", icon: Tag },
  { label: "Reporter", icon: UserCircle },
] as const;

// Presentational only (plan §9 P9 doesn't require this one to persist) — reproduces the refs'
// per-field submenu list, with Priority's own picker opening to the left when hovered.
export function NestedFieldsMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <LayoutGrid className="size-3.5" />
          Fields
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {ROWS.map(({ label, icon: Icon }) =>
          label === "Priority" ? (
            <DropdownMenuSub key={label}>
              <DropdownMenuSubTrigger className="gap-2 text-sm">
                <Icon className="size-3.5 text-muted-foreground" />
                {label}
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                {/* Radix auto-flips submenu side based on available space — no side="left" prop to force it. */}
                <DropdownMenuSubContent>
                  {PRIORITY_OPTIONS.map((opt) => (
                    <DropdownMenuItem key={opt.value} className="justify-between text-sm">
                      {opt.label}
                      {opt.value === "URGENT" && <Check className="size-3.5" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          ) : (
            <DropdownMenuItem key={label} className="gap-2 text-sm">
              <Icon className="size-3.5 text-muted-foreground" />
              <span className="flex-1">{label}</span>
              <ChevronRight className="size-3.5 text-muted-foreground" />
            </DropdownMenuItem>
          ),
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
