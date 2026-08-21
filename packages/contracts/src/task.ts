import { z } from "zod";
import { priorityEnum, statusEnum } from "./common";

export const createTaskSchema = z.object({
  workspaceId: z.string().min(1),
  projectId: z.string().min(1).nullish(),
  parentId: z.string().min(1).nullish(),
  title: z.string().min(1).max(500),
  description: z.string().max(10_000).nullish(),
  status: statusEnum.default("TODO"),
  priority: priorityEnum.default("NO_PRIORITY"),
  dueDate: z.iso.datetime({ offset: true }).nullish(),
  assigneeId: z.string().min(1).nullish(),
  reporterId: z.string().min(1).nullish(),
  team: z.string().max(200).nullish(),
  tags: z.array(z.string().max(60)).default([]),
});

export const updateTaskSchema = createTaskSchema
  .omit({ workspaceId: true })
  .partial();

export const moveTaskSchema = z.object({
  status: statusEnum,
  beforeId: z.string().min(1).nullish(),
  afterId: z.string().min(1).nullish(),
});

export const taskQuerySchema = z.object({
  workspaceId: z.string().min(1),
  projectId: z.string().min(1).optional(),
  status: statusEnum.optional(),
  q: z.string().max(200).optional(),
  groupBy: z.enum(["status"]).optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type MoveTaskInput = z.infer<typeof moveTaskSchema>;
export type TaskQuery = z.infer<typeof taskQuerySchema>;
