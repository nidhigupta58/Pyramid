import { SignalHigh } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Priority } from "@/lib/types";

const PRIORITY_LABEL: Record<Priority, string> = {
  NO_PRIORITY: "No Priority",
  URGENT: "Urgent",
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

// Matches packages/contracts' priorityEnum ordering; colours come from the --priority-* tokens (globals.css).
const PRIORITY_CLASS: Record<Priority, string> = {
  NO_PRIORITY: "text-priority-none",
  URGENT: "text-priority-urgent",
  HIGH: "text-priority-high",
  MEDIUM: "text-priority-medium",
  LOW: "text-priority-low",
};

export function PriorityCell({ priority, className }: { priority: Priority; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs", PRIORITY_CLASS[priority], className)}>
      <SignalHigh className="size-3" />
      {PRIORITY_LABEL[priority]}
    </span>
  );
}
