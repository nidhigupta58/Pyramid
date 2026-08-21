import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Status, type Task } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
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
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: TaskQueryDto) {
    const where: Prisma.TaskWhereInput = {
      workspaceId: query.workspaceId,
      parentId: null,
      ...(query.projectId && { projectId: query.projectId }),
      ...(query.status && { status: query.status }),
      ...(query.q && { title: { contains: query.q, mode: 'insensitive' } }),
    };
    const tasks = await this.prisma.task.findMany({ where, orderBy: { position: 'asc' } });

    if (query.groupBy !== 'status') return tasks;

    return Object.fromEntries(
      Object.values(Status).map((status) => [status, tasks.filter((t) => t.status === status)]),
    );
  }

  findOne(id: string) {
    return this.findOneOrThrow(id, DETAIL_INCLUDE);
  }

  async create(dto: CreateTaskDto) {
    const position = await this.appendPosition(dto.workspaceId, dto.status);
    return this.prisma.task.create({ data: { ...dto, position } });
  }

  async update(id: string, dto: UpdateTaskDto) {
    await this.findOneOrThrow(id);
    return this.prisma.task.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOneOrThrow(id);
    await this.prisma.task.delete({ where: { id } });
  }

  /** Drag-and-drop reorder: place the task between `beforeId` and `afterId`, rebalancing the column if the gap has collapsed. */
  async move(id: string, dto: MoveTaskDto): Promise<Task> {
    const task = await this.findOneOrThrow(id);
    const [before, after] = await Promise.all([
      dto.beforeId ? this.findOneOrThrow(dto.beforeId) : null,
      dto.afterId ? this.findOneOrThrow(dto.afterId) : null,
    ]);

    if (needsRebalance(before?.position ?? null, after?.position ?? null)) {
      await this.rebalanceColumn(task.workspaceId, dto.status);
      return this.move(id, dto); // positions are now spaced out; recompute the midpoint
    }

    return this.prisma.task.update({
      where: { id },
      data: { status: dto.status, position: midpointPosition(before?.position ?? null, after?.position ?? null) },
    });
  }

  private async appendPosition(workspaceId: string, status: Status = Status.TODO) {
    const last = await this.prisma.task.findFirst({
      where: { workspaceId, status, parentId: null },
      orderBy: { position: 'desc' },
      select: { position: true },
    });
    return midpointPosition(last?.position ?? null, null);
  }

  private async rebalanceColumn(workspaceId: string, status: Status) {
    const tasks = await this.prisma.task.findMany({
      where: { workspaceId, status, parentId: null },
      orderBy: { position: 'asc' },
      select: { id: true },
    });
    await this.prisma.$transaction(
      tasks.map((t, i) => this.prisma.task.update({ where: { id: t.id }, data: { position: i } })),
    );
  }

  private findOneOrThrow(id: string, include?: Prisma.TaskInclude) {
    return this.prisma.task.findUniqueOrThrow({ where: { id }, include }).catch(() => {
      throw new NotFoundException(`Task ${id} not found`);
    });
  }
}
