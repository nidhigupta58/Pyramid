import { createWorkspaceSchema, inviteMemberSchema, updateWorkspaceSchema } from '@pyramid/contracts';
import { createZodDto } from 'nestjs-zod';

export class CreateWorkspaceDto extends createZodDto(createWorkspaceSchema) {}
export class UpdateWorkspaceDto extends createZodDto(updateWorkspaceSchema) {}
export class InviteMemberDto extends createZodDto(inviteMemberSchema) {}
