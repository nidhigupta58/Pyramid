import { createCommentSchema, createTaskSchema, moveTaskSchema, taskQuerySchema, updateTaskSchema } from '@pyramid/contracts';
import { createZodDto } from 'nestjs-zod';

export class CreateTaskDto extends createZodDto(createTaskSchema) {}
export class UpdateTaskDto extends createZodDto(updateTaskSchema) {}
export class MoveTaskDto extends createZodDto(moveTaskSchema) {}
export class TaskQueryDto extends createZodDto(taskQuerySchema) {}
export class CreateCommentDto extends createZodDto(createCommentSchema) {}
