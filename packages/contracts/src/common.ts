import { z } from "zod";

// Shared enums — mirror the Prisma schema (apps/api/prisma/schema.prisma) so DTOs and UI stay in sync.
export const priorityEnum = z.enum(["NO_PRIORITY", "URGENT", "HIGH", "MEDIUM", "LOW"]);
export const statusEnum = z.enum(["TODO", "DOING", "COMPLETED", "ON_HOLD", "BACKLOG"]);
export const themeEnum = z.enum(["LIGHT", "DARK"]);
export const accentEnum = z.enum(["AMBER", "BLUE", "PINK", "ROSE", "EMERALD", "BLACK"]);
export const roleEnum = z.enum(["OWNER", "ADMIN", "MEMBER"]);

export type Priority = z.infer<typeof priorityEnum>;
export type Status = z.infer<typeof statusEnum>;
export type Theme = z.infer<typeof themeEnum>;
export type Accent = z.infer<typeof accentEnum>;
export type Role = z.infer<typeof roleEnum>;
