import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MemberSummary } from "@/lib/types";

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts.length === 1 ? parts[0].slice(0, 2).toUpperCase() : (parts[0][0] + parts[1][0]).toUpperCase();
}

/** Outlined initials for an assigned member, or a dashed "add member" affordance — ref 04/09's MemberCell. */
export function MemberCell({ member, className }: { member: MemberSummary | null; className?: string }) {
  if (!member) {
    return (
      <div
        className={cn(
          "flex size-4 items-center justify-center rounded-full border border-dashed border-border-control text-muted-foreground-faint",
          className,
        )}
      >
        <Plus className="size-2.5" />
      </div>
    );
  }

  return (
    <div
      title={member.fullName ?? undefined}
      className={cn(
        "flex size-4 items-center justify-center rounded-full border border-border-control text-[8px] font-medium text-muted-foreground",
        className,
      )}
    >
      {initials(member.fullName ?? "?")}
    </div>
  );
}
