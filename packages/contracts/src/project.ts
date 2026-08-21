import { z } from "zod";
import { priorityEnum } from "./common";

export const createProjectSchema = z.object({
  workspaceId: z.string().min(1),
  name: z.string().min(1).max(200),
  priority: priorityEnum.default("NO_PRIORITY"),
  leadId: z.string().min(1).nullish(),
  dueDate: z.iso.datetime({ offset: true }).nullish(),
});

export const updateProjectSchema = createProjectSchema
  .omit({ workspaceId: true })
  .partial();

export const projectQuerySchema = z.object({
  workspaceId: z.string().min(1),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectQuery = z.infer<typeof projectQuerySchema>;
