"use client";

import Link from "next/link";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MoreHorizontal } from "lucide-react";
import { MemberCell } from "@/components/member-cell";
import { DueBadge } from "@/components/due-badge";
import { Chip } from "@/components/chip";
import { cn } from "@/lib/utils";
import type { TaskListItem } from "@/lib/types";

export function TaskCard({ task, workspaceSlug }: { task: TaskListItem; workspaceSlug: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  return (
    <Link
      ref={setNodeRef}
      href={`/w/${workspaceSlug}/tasks/${task.id}`}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className={cn(
        "flex flex-col gap-2 rounded-lg border border-border bg-card p-2.5 shadow-sm transition-colors hover:border-border-control",
        isDragging && "opacity-50",
      )}
    >
      <div className="flex items-start gap-1.5">
        <div className="flex-1 text-sm font-medium leading-snug text-foreground">{task.title}</div>
        <MoreHorizontal className="size-3.5 shrink-0 text-muted-foreground-placeholder" />
      </div>

      <div className="flex items-center justify-between gap-1.5">
        <div className="flex min-w-0 items-center gap-1.5">
          <MemberCell member={task.assignee} className="size-3.5 text-[7px]" />
          {task.assignee?.fullName && (
            <span className="truncate text-xs text-foreground/70">{task.assignee.fullName}</span>
          )}
        </div>
        {task.dueDate && <DueBadge date={task.dueDate} />}
      </div>

      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {task.tags.map((tag, i) => (
            <Chip key={`${tag}-${i}`} label={tag} />
          ))}
        </div>
      )}
    </Link>
  );
}
