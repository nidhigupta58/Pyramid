"use client";

import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiMutate } from "@/lib/api-client";
import type { BoardData, Status, TaskListItem } from "@/lib/types";

interface MoveVars {
  taskId: string;
  status: Status;
  beforeId?: string;
  afterId?: string;
}

/** Removes the task from wherever it is, then inserts it into `status` around beforeId/afterId. */
function applyMove(data: BoardData, vars: MoveVars): BoardData {
  let moved: TaskListItem | undefined;
  const next: BoardData = { ...data };

  for (const status of Object.keys(next) as Status[]) {
    const found = next[status]?.find((t) => t.id === vars.taskId);
    if (found) {
      moved = { ...found, status: vars.status };
      next[status] = next[status].filter((t) => t.id !== vars.taskId);
    }
  }
  if (!moved) return data;

  const target = [...(next[vars.status] ?? [])];
  const beforeIdx = vars.beforeId ? target.findIndex((t) => t.id === vars.beforeId) : -1;
  const afterIdx = vars.afterId ? target.findIndex((t) => t.id === vars.afterId) : -1;
  const insertAt = beforeIdx !== -1 ? beforeIdx + 1 : afterIdx !== -1 ? afterIdx : target.length;

  target.splice(insertAt, 0, moved);
  next[vars.status] = target;
  return next;
}

export function useMoveTask(workspaceSlug: string, queryKey: QueryKey) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, ...body }: MoveVars) =>
      apiMutate(`/workspaces/${workspaceSlug}/tasks/${taskId}/move`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    onMutate: async (vars: MoveVars) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<BoardData>(queryKey);
      if (previous) queryClient.setQueryData<BoardData>(queryKey, applyMove(previous, vars));
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
      toast.error("Couldn't move task. Try again.");
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });
}
