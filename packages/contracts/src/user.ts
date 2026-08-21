import { z } from "zod";
import { accentEnum, themeEnum } from "./common";

export const updateProfileSchema = z.object({
  fullName: z.string().min(1).max(200).nullish(),
  title: z.string().max(200).nullish(),
  username: z.string().min(1).max(60).nullish(),
  avatarUrl: z.string().url().nullish(),
});

export const updatePreferencesSchema = z.object({
  theme: themeEnum.optional(),
  accent: accentEnum.optional(),
  listFields: z.record(z.string(), z.boolean()).optional(),
  boardFields: z.record(z.string(), z.boolean()).optional(),
  defaultView: z.enum(["board", "list"]).optional(),
  activeWorkspaceId: z.string().min(1).nullish(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
