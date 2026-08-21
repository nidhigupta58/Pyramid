import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Status, type Task } from '@prisma/client';
import { TenantPrismaService } from '../prisma/tenant-prisma.service';
import { midpointPosition, needsRebalance } from '../common/position.util';
import { CreateTaskDto, MoveTaskDto, TaskQueryDto, UpdateTaskDto } from './dto/task.dto';

const DETAIL_INCLUDE = {
  subtasks: { orderBy: { position: 'asc' } },
  labels: { include: { label: true } },
  comments: { orderBy: { createdAt: 'asc' } },
  activity: { orderBy: { createdAt: 'asc' } },
} satisfies Prisma.TaskInclude;

@Injectable()
export class TasksService {
  constructor(private readonly tenantPrisma: TenantPrismaService) {}

  private get db() {
    return this.tenantPrisma.client;
  }

  async findAll(query: TaskQueryDto) {
    const where: Prisma.TaskWhereInput = {
      parentId: null,
      ...(query.projectId && { projectId: query.projectId }),
      ...(query.status && { status: query.status }),
      ...(query.q && { title: { contains: query.q, mode: 'insensitive' } }),
    };
    const tasks = await this.db.task.findMany({ where, orderBy: { position: 'asc' } });

    if (query.groupBy !== 'status') return tasks;

    return Object.fromEntries(
      Object.values(Status).map((status) => [status, tasks.filter((t) => t.status === status)]),
    );
  }

  findOne(id: string) {
    return this.findOneOrThrow(id, DETAIL_INCLUDE);
  }

  async create(dto: CreateTaskDto) {
    const position = await this.appendPosition(dto.status);
    // workspaceId is a placeholder here — workspaceScopingExtension overwrites it before the query runs.
    return this.db.task.create({ data: { ...dto, position, workspaceId: '' } });
  }

  async update(id: string, dto: UpdateTaskDto) {
    await this.findOneOrThrow(id);
    return this.db.task.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOneOrThrow(id);
    await this.db.task.delete({ where: { id } });
  }

  /** Drag-and-drop reorder: place the task between `beforeId` and `afterId`, rebalancing the column if the gap has collapsed. */
  async move(id: string, dto: MoveTaskDto): Promise<Task> {
    await this.findOneOrThrow(id);
    const [before, after] = await Promise.all([
      dto.beforeId ? this.findOneOrThrow(dto.beforeId) : null,
      dto.afterId ? this.findOneOrThrow(dto.afterId) : null,
    ]);

    if (needsRebalance(before?.position ?? null, after?.position ?? null)) {
      await this.rebalanceColumn(dto.status);
      return this.move(id, dto); // positions are now spaced out; recompute the midpoint
    }

    return this.db.task.update({
      where: { id },
      data: { status: dto.status, position: midpointPosition(before?.position ?? null, after?.position ?? null) },
    });
  }

  private async appendPosition(status: Status = Status.TODO) {
    const last = await this.db.task.findFirst({
      where: { status, parentId: null },
      orderBy: { position: 'desc' },
      select: { position: true },
    });
    return midpointPosition(last?.position ?? null, null);
  }

  private async rebalanceColumn(status: Status) {
    const tasks = await this.db.task.findMany({
      where: { status, parentId: null },
      orderBy: { position: 'asc' },
      select: { id: true },
    });
    await this.db.$transaction(tasks.map((t, i) => this.db.task.update({ where: { id: t.id }, data: { position: i } })));
  }

  private findOneOrThrow(id: string, include?: Prisma.TaskInclude) {
    return this.db.task.findUniqueOrThrow({ where: { id }, include }).catch(() => {
      throw new NotFoundException(`Task ${id} not found`);
    });
  }
}
