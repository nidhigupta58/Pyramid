import type { Status } from "./types";

export const STATUS_LABEL: Record<Status, string> = {
  TODO: "To Do",
  DOING: "Doing",
  COMPLETED: "Completed",
  ON_HOLD: "On Hold",
  BACKLOG: "Backlog",
};

// Only Backlog has a dedicated colour in the refs (--status-backlog); everything else is neutral.
export function statusDotClassName(status: Status): string {
  return status === "BACKLOG" ? "bg-status-backlog" : "bg-muted-foreground-placeholder";
}
