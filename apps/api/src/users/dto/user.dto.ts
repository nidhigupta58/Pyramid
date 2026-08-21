import { updatePreferencesSchema, updateProfileSchema } from '@pyramid/contracts';
import { createZodDto } from 'nestjs-zod';

export class UpdateProfileDto extends createZodDto(updateProfileSchema) {}
export class UpdatePreferencesDto extends createZodDto(updatePreferencesSchema) {}
