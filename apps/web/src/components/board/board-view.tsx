"use client";

import { useQuery } from "@tanstack/react-query";
import {
  DndContext,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
} from "@dnd-kit/core";
import { BoardColumn } from "./board-column";
import { useMoveTask } from "@/hooks/use-move-task";
import { apiMutate } from "@/lib/api-client";
import type { FieldsState } from "@/lib/fields";
import type { BoardData, Status } from "@/lib/types";

// Refs 02/12: the board only ever shows these four columns (no Backlog), unlike the wider
// status set the API otherwise supports.
const BOARD_STATUSES: { status: Status; label: string }[] = [
  { status: "TODO", label: "To Do" },
  { status: "DOING", label: "Doing" },
  { status: "COMPLETED", label: "Completed" },
  { status: "ON_HOLD", label: "On Hold" },
];

// Hit-test where the pointer actually is first (so dropping in a column's empty space
// resolves to that column, not the nearest card's center in an adjacent column), falling
// back to rect intersection for the edge case where the pointer briefly clears every rect.
const collisionDetection: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);
  return pointerCollisions.length > 0 ? pointerCollisions : rectIntersection(args);
};

export function BoardView({
  workspaceSlug,
  initialData,
  fields,
}: {
  workspaceSlug: string;
  initialData: BoardData;
  fields: FieldsState;
}) {
  const queryKey = ["tasks", workspaceSlug, "board"] as const;
  const { data } = useQuery({
    queryKey,
    queryFn: () => apiMutate<BoardData>(`/workspaces/${workspaceSlug}/tasks?groupBy=status`),
    initialData,
    staleTime: 10_000,
  });
  const move = useMoveTask(workspaceSlug, queryKey);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  function statusOf(taskId: string): Status | undefined {
    return (Object.keys(data) as Status[]).find((status) => data[status]?.some((t) => t.id === taskId));
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over) return;
    const taskId = String(active.id);
    const overId = String(over.id);
    if (taskId === overId) return;

    const sourceStatus = statusOf(taskId);
    if (!sourceStatus) return;

    if (overId.startsWith("column:")) {
      const destStatus = overId.slice("column:".length) as Status;
      const destList = data[destStatus] ?? [];
      const lastId = destList.at(-1)?.id;
      move.mutate({ taskId, status: destStatus, beforeId: lastId === taskId ? undefined : lastId });
      return;
    }

    const destStatus = statusOf(overId);
    if (!destStatus) return;
    const destList = data[destStatus] ?? [];
    const overIndex = destList.findIndex((t) => t.id === overId);
    const beforeId = overIndex > 0 ? destList[overIndex - 1].id : undefined;
    const afterId = destList[overIndex]?.id;

    move.mutate({
      taskId,
      status: destStatus,
      beforeId: beforeId === taskId ? undefined : beforeId,
      afterId: afterId === taskId ? undefined : afterId,
    });
  }

  return (
    <DndContext id="board-dnd" sensors={sensors} collisionDetection={collisionDetection} onDragEnd={handleDragEnd}>
      <div className="flex min-w-fit snap-x snap-proximity gap-3.5 overflow-x-auto pb-2">
        {BOARD_STATUSES.map(({ status, label }) => (
          <BoardColumn
            key={status}
            status={status}
            label={label}
            tasks={data[status] ?? []}
            workspaceSlug={workspaceSlug}
            fields={fields}
          />
        ))}
      </div>
    </DndContext>
  );
}
