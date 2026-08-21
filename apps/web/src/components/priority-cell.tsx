import { SignalHigh } from "lucide-react";
import { cn } from "@/lib/utils";
import { PRIORITY_CLASS, PRIORITY_LABEL } from "@/lib/priority";
import type { Priority } from "@/lib/types";

export function PriorityCell({ priority, className }: { priority: Priority; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs", PRIORITY_CLASS[priority], className)}>
      <SignalHigh className="size-3" />
      {PRIORITY_LABEL[priority]}
    </span>
  );
}
