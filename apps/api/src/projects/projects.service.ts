import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { midpointPosition } from '../common/position.util';
import { CreateProjectDto, ProjectQueryDto, UpdateProjectDto } from './dto/project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll({ workspaceId }: ProjectQueryDto) {
    return this.prisma.project.findMany({
      where: { workspaceId },
      orderBy: { position: 'asc' },
    });
  }

  async create(dto: CreateProjectDto) {
    const last = await this.prisma.project.findFirst({
      where: { workspaceId: dto.workspaceId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    return this.prisma.project.create({
      data: { ...dto, position: midpointPosition(last?.position ?? null, null) },
    });
  }

  async update(id: string, dto: UpdateProjectDto) {
    await this.findOneOrThrow(id);
    return this.prisma.project.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOneOrThrow(id);
    await this.prisma.project.delete({ where: { id } });
  }

  private async findOneOrThrow(id: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException(`Project ${id} not found`);
    return project;
  }
}
