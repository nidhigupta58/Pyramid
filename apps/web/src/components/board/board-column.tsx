"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { GripVertical, MoreHorizontal, Plus } from "lucide-react";
import { TaskCard } from "./task-card";
import { StubAction } from "@/components/stub-action";
import type { FieldsState } from "@/lib/fields";
import type { TaskListItem } from "@/lib/types";

export function BoardColumn({
  status,
  label,
  tasks,
  workspaceSlug,
  fields,
}: {
  status: string;
  label: string;
  tasks: TaskListItem[];
  workspaceSlug: string;
  fields: FieldsState;
}) {
  // Droppable spans the whole column (not just the card list) so dropping in the empty space
  // below the last card still counts as "append to this column" rather than being a dead zone.
  const { setNodeRef } = useDroppable({ id: `column:${status}` });

  return (
    <div
      ref={setNodeRef}
      className="flex w-72 shrink-0 snap-start flex-col gap-2 rounded-lg border border-border bg-muted p-2"
    >
      <div className="flex items-center gap-1.5 px-0.5 py-0.5">
        <GripVertical className="size-3 text-muted-foreground-placeholder" />
        <span className="flex-1 text-sm font-medium text-foreground">{label}</span>
        <StubAction label="Add task" icon={<Plus className="size-3.5" />} className="p-0.5 text-muted-foreground-faint hover:text-foreground" />
        <StubAction label="Column actions" icon={<MoreHorizontal className="size-3.5" />} className="p-0.5 text-muted-foreground-faint hover:text-foreground" />
      </div>

      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-1 flex-col gap-2">
          {tasks.length === 0 ? (
            <p className="px-1 py-3 text-center text-xs text-muted-foreground-faint">No tasks yet</p>
          ) : (
            tasks.map((task) => <TaskCard key={task.id} task={task} workspaceSlug={workspaceSlug} fields={fields} />)
          )}
        </div>
      </SortableContext>

      <StubAction
        label="Add Task"
        icon={<Plus className="size-3" />}
        className="px-1 py-1 text-xs text-muted-foreground-faint hover:text-foreground"
      >
        Add Task
      </StubAction>
    </div>
  );
}
