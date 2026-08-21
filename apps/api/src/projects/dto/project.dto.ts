import { createProjectSchema, projectQuerySchema, updateProjectSchema } from '@pyramid/contracts';
import { createZodDto } from 'nestjs-zod';

export class CreateProjectDto extends createZodDto(createProjectSchema) {}
export class UpdateProjectDto extends createZodDto(updateProjectSchema) {}
export class ProjectQueryDto extends createZodDto(projectQuerySchema) {}
