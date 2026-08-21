import { Tag } from "lucide-react";
import { cn } from "@/lib/utils";

/** The small bordered "◇ label" pill used for board-card tags and (later) task-detail labels. */
export function Chip({ label, className }: { label: string; className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-md border border-border px-1.5 py-0.5 text-xs text-muted-foreground",
        className,
      )}
    >
      <Tag className="size-2.5" />
      {label}
    </div>
  );
}
