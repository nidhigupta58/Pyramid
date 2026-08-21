import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/bootstrap';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Tenancy (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = configureApp(moduleFixture.createNestApplication(), { swagger: false });
    await app.init();
    prisma = moduleFixture.get(PrismaService);
  });

  afterAll(() => app.close());

  /** A guest session plus its own workspace slug, with a teardown that removes both. */
  async function tenant() {
    const agent = request.agent(app.getHttpServer());
    const { body: user } = await agent.post('/api/v1/auth/guest').expect(200);
    const { body: workspaces } = await agent.get('/api/v1/workspaces').expect(200);
    const slug = workspaces[0].slug as string;
    const cleanup = async () => {
      await prisma.workspace.delete({ where: { id: workspaces[0].id } }).catch(() => {});
      await prisma.user.delete({ where: { id: user.id } }).catch(() => {});
    };
    return { agent, user, slug, workspaceId: workspaces[0].id as string, cleanup };
  }

  // The gate from plan §4.3: two workspaces, two users, every tenant route 404s across the boundary.
  it('never lets one tenant read or write another tenant"s rows', async () => {
    const a = await tenant();
    const b = await tenant();

    const project = await a.agent
      .post(`/api/v1/workspaces/${a.slug}/projects`)
      .send({ name: 'A-only project' })
      .expect(201);
    const task = await a.agent.post(`/api/v1/workspaces/${a.slug}/tasks`).send({ title: 'A-only task' }).expect(201);

    // B can't even resolve A's slug.
    await b.agent.get(`/api/v1/workspaces/${a.slug}/projects`).expect(404);
    await b.agent.get(`/api/v1/workspaces/${a.slug}/tasks`).expect(404);

    // Nor can B reach A's rows by id through B's own (valid) slug.
    await b.agent
      .patch(`/api/v1/workspaces/${b.slug}/projects/${project.body.id}`)
      .send({ priority: 'HIGH' })
      .expect(404);
    await b.agent.get(`/api/v1/workspaces/${b.slug}/tasks/${task.body.id}`).expect(404);
    await b.agent.patch(`/api/v1/workspaces/${b.slug}/tasks/${task.body.id}`).send({ title: 'hijacked' }).expect(404);
    await b.agent.delete(`/api/v1/workspaces/${b.slug}/tasks/${task.body.id}`).expect(404);

    // And B's own (empty) workspace proves the isolation isn't just an auth failure.
    await b.agent.get(`/api/v1/workspaces/${b.slug}/projects`).expect(200, []);
    await b.agent.get(`/api/v1/workspaces/${b.slug}/tasks`).expect(200, []);

    await a.cleanup();
    await b.cleanup();
  });

  it('a non-member gets 404 (not 403) for a real workspace slug', async () => {
    const a = await tenant();
    const b = await tenant();

    await b.agent.get(`/api/v1/workspaces/${a.slug}/members`).expect(404);

    await a.cleanup();
    await b.cleanup();
  });

  it('roles: only OWNER/ADMIN can invite or remove members', async () => {
    const owner = await tenant();
    const member = await tenant();

    const invite = await owner.agent
      .post(`/api/v1/workspaces/${owner.slug}/invitations`)
      .send({ email: member.user.email })
      .expect(201);
    await member.agent.post(`/api/v1/invitations/${invite.body.token}/accept`).expect(201);

    await member.agent
      .post(`/api/v1/workspaces/${owner.slug}/invitations`)
      .send({ email: 'someone-else@pyramid.local' })
      .expect(403);
    await member.agent.delete(`/api/v1/workspaces/${owner.slug}/members/${owner.user.id}`).expect(403);

    await owner.agent.delete(`/api/v1/workspaces/${owner.slug}/members/${member.user.id}`).expect(200);

    await owner.cleanup();
    await member.cleanup();
  });

  it('refuses to let the sole owner leave, but allows a member to leave', async () => {
    const owner = await tenant();
    const member = await tenant();

    const invite = await owner.agent
      .post(`/api/v1/workspaces/${owner.slug}/invitations`)
      .send({ email: member.user.email })
      .expect(201);
    await member.agent.post(`/api/v1/invitations/${invite.body.token}/accept`).expect(201);

    await owner.agent.post('/api/v1/me/leave-workspace').send({ workspaceId: owner.workspaceId }).expect(403);
    await member.agent.post('/api/v1/me/leave-workspace').send({ workspaceId: owner.workspaceId }).expect(200);

    await owner.cleanup();
    await member.cleanup();
  });
});
