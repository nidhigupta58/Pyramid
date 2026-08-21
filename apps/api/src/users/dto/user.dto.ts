import { activeWorkspaceSchema, leaveWorkspaceSchema, updatePreferencesSchema, updateProfileSchema } from '@pyramid/contracts';
import { createZodDto } from 'nestjs-zod';

export class UpdateProfileDto extends createZodDto(updateProfileSchema) {}
export class UpdatePreferencesDto extends createZodDto(updatePreferencesSchema) {}
export class ActiveWorkspaceDto extends createZodDto(activeWorkspaceSchema) {}
export class LeaveWorkspaceDto extends createZodDto(leaveWorkspaceSchema) {}
