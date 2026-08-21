"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

// Isolated from GroupedTable because it needs client-side state (open/closed) — GroupedTable
// itself renders on the server, and functions/JSX-producing closures can't cross that boundary
// as props, only pre-rendered ReactNode children can.
export function CollapsibleGroup({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(true);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="flex flex-col gap-1.5">
      <CollapsibleTrigger className="flex w-fit items-center gap-1.5 text-sm font-medium text-foreground/80">
        <ChevronDown className={cn("size-3 text-muted-foreground transition-transform", !open && "-rotate-90")} />
        {label}
      </CollapsibleTrigger>
      <CollapsibleContent>{children}</CollapsibleContent>
    </Collapsible>
  );
}
