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
  let guestUserId: string;
  let workspaceSlug: string;
  let agent: ReturnType<typeof request.agent>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = configureApp(moduleFixture.createNestApplication(), { swagger: false });
    await app.init();
    prisma = moduleFixture.get(PrismaService);

    // Every request below runs as this guest, inside the workspace guest login creates for it.
    agent = request.agent(app.getHttpServer());
    const guest = await agent.post('/api/v1/auth/guest').expect(200);
    guestUserId = guest.body.id;
    const { body: workspaces } = await agent.get('/api/v1/workspaces').expect(200);
    workspaceSlug = workspaces[0].slug;
  });

  afterAll(async () => {
    const pref = await prisma.userPreference.findUnique({ where: { userId: guestUserId } });
    if (pref?.activeWorkspaceId) await prisma.workspace.delete({ where: { id: pref.activeWorkspaceId } });
    await prisma.user.delete({ where: { id: guestUserId } });
    await app.close();
  });

  const api = () => agent;
  const w = (path: string) => `/api/v1/workspaces/${workspaceSlug}${path}`;

  describe('/projects', () => {
    let projectId: string;

    it('POST creates a project', async () => {
      const res = await api().post(w('/projects')).send({ name: 'Launch Website', priority: 'HIGH' }).expect(201);
      expect(res.body).toMatchObject({ name: 'Launch Website', priority: 'HIGH' });
      projectId = res.body.id;
    });

    it('GET lists projects for the workspace', async () => {
      const res = await api().get(w('/projects')).expect(200);
      expect(res.body).toEqual([expect.objectContaining({ id: projectId })]);
    });

    it('PATCH updates a project', async () => {
      const res = await api().patch(w(`/projects/${projectId}`)).send({ priority: 'LOW' }).expect(200);
      expect(res.body.priority).toBe('LOW');
    });

    it('DELETE removes a project', async () => {
      await api().delete(w(`/projects/${projectId}`)).expect(200);
      await api().get(w('/projects')).expect(200, []);
    });

    it('PATCH a missing project returns problem+json 404', async () => {
      const res = await api().patch(w('/projects/does-not-exist')).send({ priority: 'LOW' }).expect(404);
      expect(res.body).toMatchObject({ status: 404 });
    });
  });

  describe('/tasks', () => {
    let firstId: string;
    let secondId: string;

    it('POST creates tasks', async () => {
      const first = await api().post(w('/tasks')).send({ title: 'Write tests', status: 'TODO' }).expect(201);
      const second = await api().post(w('/tasks')).send({ title: 'Ship it', status: 'TODO' }).expect(201);
      firstId = first.body.id;
      secondId = second.body.id;
      expect(second.body.position).toBeGreaterThan(first.body.position);
    });

    it('rejects a body missing the required title', async () => {
      const res = await api().post(w('/tasks')).send({}).expect(400);
      expect(res.body.type).toBe('about:blank');
    });

    it('GET /tasks/:id returns the detail shape with relations', async () => {
      const res = await api().get(w(`/tasks/${firstId}`)).expect(200);
      expect(res.body).toMatchObject({ id: firstId, subtasks: [], labels: [], comments: [], activity: [] });
    });

    it('GET /tasks?groupBy=status groups by status', async () => {
      const res = await api().get(w('/tasks?groupBy=status')).expect(200);
      expect(res.body.TODO).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: firstId }), expect.objectContaining({ id: secondId })]),
      );
    });

    it('PATCH /tasks/:id/move reorders within a column', async () => {
      const res = await api().patch(w(`/tasks/${firstId}/move`)).send({ status: 'TODO', beforeId: secondId }).expect(200);
      expect(res.body.status).toBe('TODO');

      const grouped = await api().get(w('/tasks?groupBy=status')).expect(200);
      const order = grouped.body.TODO.map((t: { id: string }) => t.id);
      expect(order.indexOf(secondId)).toBeLessThan(order.indexOf(firstId));
    });

    it('PATCH /tasks/:id/move across statuses', async () => {
      const res = await api().patch(w(`/tasks/${firstId}/move`)).send({ status: 'DOING' }).expect(200);
      expect(res.body.status).toBe('DOING');
    });

    it('DELETE removes a task', async () => {
      await api().delete(w(`/tasks/${firstId}`)).expect(200);
      await api().get(w(`/tasks/${firstId}`)).expect(404);
      await api().delete(w(`/tasks/${secondId}`)).expect(200);
    });
  });
});
