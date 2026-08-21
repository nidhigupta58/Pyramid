import type { Priority } from "./types";

export const PRIORITY_LABEL: Record<Priority, string> = {
  NO_PRIORITY: "No Priority",
  URGENT: "Urgent",
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

// Matches packages/contracts' priorityEnum ordering; colours come from the --priority-* tokens (globals.css).
export const PRIORITY_CLASS: Record<Priority, string> = {
  NO_PRIORITY: "text-priority-none",
  URGENT: "text-priority-urgent",
  HIGH: "text-priority-high",
  MEDIUM: "text-priority-medium",
  LOW: "text-priority-low",
};

// Menu order from the refs: No Priority, Urgent, High, Medium, Low.
export const PRIORITY_ORDER: Priority[] = ["NO_PRIORITY", "URGENT", "HIGH", "MEDIUM", "LOW"];
