import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { WorkspaceGuard } from '../workspaces/guards/workspace.guard';
import { WorkspaceContextInterceptor } from '../workspaces/interceptors/workspace-context.interceptor';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, ProjectQueryDto, UpdateProjectDto } from './dto/project.dto';

@ApiTags('projects')
@UseGuards(WorkspaceGuard)
@UseInterceptors(WorkspaceContextInterceptor)
@Controller('workspaces/:workspaceSlug/projects')
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get()
  findAll(@Query() query: ProjectQueryDto) {
    return this.projects.findAll(query);
  }

  @Post()
  create(@Body() dto: CreateProjectDto) {
    return this.projects.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projects.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projects.remove(id);
  }
}
