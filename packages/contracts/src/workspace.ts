import { z } from "zod";
import { roleEnum } from "./common";

export const createWorkspaceSchema = z.object({
  name: z.string().min(1).max(200),
});

export const updateWorkspaceSchema = createWorkspaceSchema.partial();

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: roleEnum.exclude(["OWNER"]).default("MEMBER"),
});

export const activeWorkspaceSchema = z.object({
  workspaceId: z.string().min(1),
});

export const leaveWorkspaceSchema = z.object({
  workspaceId: z.string().min(1),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type ActiveWorkspaceInput = z.infer<typeof activeWorkspaceSchema>;
export type LeaveWorkspaceInput = z.infer<typeof leaveWorkspaceSchema>;
