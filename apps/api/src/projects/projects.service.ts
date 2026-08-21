import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { TenantPrismaService } from '../prisma/tenant-prisma.service';
import { midpointPosition } from '../common/position.util';
import { CreateProjectDto, ProjectQueryDto, UpdateProjectDto } from './dto/project.dto';

const LEAD_INCLUDE = {
  lead: { select: { id: true, fullName: true, avatarUrl: true } },
} satisfies Prisma.ProjectInclude;

@Injectable()
export class ProjectsService {
  constructor(private readonly tenantPrisma: TenantPrismaService) {}

  private get db() {
    return this.tenantPrisma.client;
  }

  findAll(query: ProjectQueryDto) {
    return this.db.project.findMany({
      where: query.q ? { name: { contains: query.q, mode: 'insensitive' } } : undefined,
      orderBy: { position: 'asc' },
      include: LEAD_INCLUDE,
    });
  }

  async create(dto: CreateProjectDto) {
    const last = await this.db.project.findFirst({
      orderBy: { position: 'desc' },
      select: { position: true },
    });
    return this.db.project.create({
      // workspaceId is a placeholder here — workspaceScopingExtension overwrites it before the query runs.
      data: { ...dto, position: midpointPosition(last?.position ?? null, null), workspaceId: '' },
    });
  }

  async update(id: string, dto: UpdateProjectDto) {
    await this.findOneOrThrow(id);
    return this.db.project.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOneOrThrow(id);
    await this.db.project.delete({ where: { id } });
  }

  private async findOneOrThrow(id: string) {
    const project = await this.db.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException(`Project ${id} not found`);
    return project;
  }
}
