import { Calendar, ChevronDown, Flag, SignalHigh, Tag, UserCircle } from "lucide-react";
import { format } from "date-fns";
import { MemberCell } from "@/components/member-cell";
import { PriorityMenu } from "./priority-menu";
import { DatePickerMenu } from "./date-picker-menu";
import { PRIORITY_CLASS, PRIORITY_LABEL } from "@/lib/priority";
import { STATUS_LABEL, statusDotClassName } from "@/lib/status";
import type { TaskDetail } from "@/lib/types";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid min-h-[26px] grid-cols-[74px_1fr] items-center text-sm">
      <div className="text-muted-foreground-faint">{label}</div>
      <div className="flex items-center gap-1.5">{children}</div>
    </div>
  );
}

export function DetailsPanel({ task, workspaceSlug }: { task: TaskDetail; workspaceSlug: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg border border-border p-3">
      <div className="mb-1.5 text-sm font-semibold text-foreground">Details</div>

      <Row label="Status">
        <span className={`size-1.5 rounded-full ${statusDotClassName(task.status)}`} />
        <span className="text-foreground/80">{STATUS_LABEL[task.status]}</span>
      </Row>

      <Row label="Priority">
        <PriorityMenu taskId={task.id} workspaceSlug={workspaceSlug} priority={task.priority}>
          <button
            type="button"
            className={`flex items-center gap-1.5 rounded px-1 py-0.5 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50 ${PRIORITY_CLASS[task.priority]}`}
          >
            <SignalHigh className="size-3.5" />
            {PRIORITY_LABEL[task.priority]}
            <ChevronDown className="size-3 text-muted-foreground" />
          </button>
        </PriorityMenu>
      </Row>

      <Row label="Members">
        {task.assignee ? (
          <>
            <MemberCell member={task.assignee} className="size-4 text-[8px]" />
            <span className="text-foreground/80">{task.assignee.fullName}</span>
          </>
        ) : (
          <span className="text-muted-foreground-faint">Add members</span>
        )}
      </Row>

      <Row label="Dates">
        <DatePickerMenu taskId={task.id} workspaceSlug={workspaceSlug} dueDate={task.dueDate}>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded px-1 py-0.5 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <Calendar className="size-3.5 text-muted-foreground" />
            <span className={task.dueDate ? "text-foreground/80" : "text-muted-foreground-faint"}>
              {task.dueDate ? format(new Date(task.dueDate), "MMM d") : "Add dates"}
            </span>
          </button>
        </DatePickerMenu>
      </Row>

      <Row label="Labels">
        <Tag className="size-3.5 text-muted-foreground" />
        <span className="text-foreground/80">
          {task.labels.length > 0 ? `${task.labels.length} labels` : "Add labels"}
        </span>
      </Row>

      <Row label="Teams">
        <Flag className="size-3.5 text-muted-foreground" />
        <span className={task.team ? "text-foreground/80" : "text-muted-foreground-faint"}>
          {task.team ?? "Add team"}
        </span>
      </Row>

      <Row label="Reporter">
        <UserCircle className="size-3.5 text-muted-foreground" />
        <span className={task.reporter ? "text-foreground/80" : "text-muted-foreground-faint"}>
          {task.reporter?.fullName ?? "Add reporter"}
        </span>
      </Row>
    </div>
  );
}
