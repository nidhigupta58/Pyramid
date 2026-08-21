import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/bootstrap';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Tasks + Projects (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let workspaceId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = configureApp(moduleFixture.createNestApplication(), { swagger: false });
    await app.init();

    prisma = moduleFixture.get(PrismaService);
    const workspace = await prisma.workspace.create({
      data: { name: 'E2E Workspace', slug: `e2e-${Date.now()}` },
    });
    workspaceId = workspace.id;
  });

  afterAll(async () => {
    await prisma.workspace.delete({ where: { id: workspaceId } });
    await app.close();
  });

  const api = () => request(app.getHttpServer());

  describe('/projects', () => {
    let projectId: string;

    it('POST creates a project', async () => {
      const res = await api()
        .post('/api/v1/projects')
        .send({ workspaceId, name: 'Launch Website', priority: 'HIGH' })
        .expect(201);
      expect(res.body).toMatchObject({ workspaceId, name: 'Launch Website', priority: 'HIGH' });
      projectId = res.body.id;
    });

    it('GET lists projects for the workspace', async () => {
      const res = await api().get(`/api/v1/projects?workspaceId=${workspaceId}`).expect(200);
      expect(res.body).toEqual([expect.objectContaining({ id: projectId })]);
    });

    it('PATCH updates a project', async () => {
      const res = await api().patch(`/api/v1/projects/${projectId}`).send({ priority: 'LOW' }).expect(200);
      expect(res.body.priority).toBe('LOW');
    });

    it('DELETE removes a project', async () => {
      await api().delete(`/api/v1/projects/${projectId}`).expect(200);
      await api().get(`/api/v1/projects?workspaceId=${workspaceId}`).expect(200, []);
    });

    it('PATCH a missing project returns problem+json 404', async () => {
      const res = await api().patch('/api/v1/projects/does-not-exist').send({ priority: 'LOW' }).expect(404);
      expect(res.body).toMatchObject({ status: 404 });
    });
  });

  describe('/tasks', () => {
    let firstId: string;
    let secondId: string;

    it('POST creates tasks', async () => {
      const first = await api()
        .post('/api/v1/tasks')
        .send({ workspaceId, title: 'Write tests', status: 'TODO' })
        .expect(201);
      const second = await api()
        .post('/api/v1/tasks')
        .send({ workspaceId, title: 'Ship it', status: 'TODO' })
        .expect(201);
      firstId = first.body.id;
      secondId = second.body.id;
      expect(second.body.position).toBeGreaterThan(first.body.position);
    });

    it('rejects a body missing the required title', async () => {
      const res = await api().post('/api/v1/tasks').send({ workspaceId }).expect(400);
      expect(res.body.type).toBe('about:blank');
    });

    it('GET /tasks/:id returns the detail shape with relations', async () => {
      const res = await api().get(`/api/v1/tasks/${firstId}`).expect(200);
      expect(res.body).toMatchObject({ id: firstId, subtasks: [], labels: [], comments: [], activity: [] });
    });

    it('GET /tasks?groupBy=status groups by status', async () => {
      const res = await api().get(`/api/v1/tasks?workspaceId=${workspaceId}&groupBy=status`).expect(200);
      expect(res.body.TODO).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: firstId }), expect.objectContaining({ id: secondId })]),
      );
    });

    it('PATCH /tasks/:id/move reorders within a column', async () => {
      const res = await api()
        .patch(`/api/v1/tasks/${firstId}/move`)
        .send({ status: 'TODO', beforeId: secondId })
        .expect(200);
      expect(res.body.status).toBe('TODO');

      const grouped = await api().get(`/api/v1/tasks?workspaceId=${workspaceId}&groupBy=status`).expect(200);
      const order = grouped.body.TODO.map((t: { id: string }) => t.id);
      expect(order.indexOf(secondId)).toBeLessThan(order.indexOf(firstId));
    });

    it('PATCH /tasks/:id/move across statuses', async () => {
      const res = await api().patch(`/api/v1/tasks/${firstId}/move`).send({ status: 'DOING' }).expect(200);
      expect(res.body.status).toBe('DOING');
    });

    it('DELETE removes a task', async () => {
      await api().delete(`/api/v1/tasks/${firstId}`).expect(200);
      await api().get(`/api/v1/tasks/${firstId}`).expect(404);
      await api().delete(`/api/v1/tasks/${secondId}`).expect(200);
    });
  });
});
