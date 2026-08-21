import { cn } from "@/lib/utils";

/** The gradient avatar used throughout the refs wherever a user has no photo — one component, per plan §3.1. */
export function UserAvatar({ className }: { className?: string }) {
  return (
    <div
      className={cn("size-6 shrink-0 rounded-full", className)}
      style={{ backgroundImage: "var(--gradient-avatar)" }}
    />
  );
}
