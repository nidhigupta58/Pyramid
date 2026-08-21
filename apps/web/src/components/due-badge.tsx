import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function DueBadge({ date, className }: { date: string; className?: string }) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs font-medium",
        className,
      )}
      style={{ background: "var(--due-bg)", borderColor: "var(--due-border)", color: "var(--due-fg)" }}
    >
      <Calendar className="size-2.5" />
      {format(new Date(date), "d MMM")}
    </div>
  );
}
