import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { WorkspaceGuard } from '../workspaces/guards/workspace.guard';
import { WorkspaceContextInterceptor } from '../workspaces/interceptors/workspace-context.interceptor';
import { TasksService } from './tasks.service';
import { CreateTaskDto, MoveTaskDto, TaskQueryDto, UpdateTaskDto } from './dto/task.dto';

@ApiTags('tasks')
@UseGuards(WorkspaceGuard)
@UseInterceptors(WorkspaceContextInterceptor)
@Controller('workspaces/:workspaceSlug/tasks')
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Get()
  findAll(@Query() query: TaskQueryDto) {
    return this.tasks.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasks.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateTaskDto) {
    return this.tasks.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.tasks.update(id, dto);
  }

  @Patch(':id/move')
  move(@Param('id') id: string, @Body() dto: MoveTaskDto) {
    return this.tasks.move(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tasks.remove(id);
  }
}
