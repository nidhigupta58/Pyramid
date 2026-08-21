import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/bootstrap';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = configureApp(moduleFixture.createNestApplication(), { swagger: false });
    await app.init();
    prisma = moduleFixture.get(PrismaService);
  });

  afterAll(() => app.close());

  /** Logs in a fresh guest and returns its session agent, user, and a matching teardown. */
  async function loginAsGuest() {
    const agent = request.agent(app.getHttpServer());
    const { body: user } = await agent.post('/api/v1/auth/guest').expect(200);
    const cleanup = async () => {
      const pref = await prisma.userPreference.findUnique({ where: { userId: user.id } });
      if (pref?.activeWorkspaceId) await prisma.workspace.delete({ where: { id: pref.activeWorkspaceId } });
      await prisma.user.delete({ where: { id: user.id } });
    };
    return { agent, user, cleanup };
  }

  it('rejects protected routes with no session', () => {
    return request(app.getHttpServer()).get('/api/v1/me').expect(401);
  });

  it('POST /auth/guest creates a guest user, workspace, and session cookie', async () => {
    const agent = request.agent(app.getHttpServer());
    const res = await agent.post('/api/v1/auth/guest').expect(200);
    expect(res.body).toMatchObject({ isGuest: true });
    expect(res.headers['set-cookie']).toEqual(
      expect.arrayContaining([expect.stringContaining('access_token='), expect.stringContaining('refresh_token=')]),
    );

    const me = await agent.get('/api/v1/me').expect(200);
    expect(me.body.id).toBe(res.body.id);

    const prefs = await agent.get('/api/v1/me/preferences').expect(200);
    expect(prefs.body).toMatchObject({ theme: 'LIGHT', accent: 'BLUE', defaultView: 'board' });

    await prisma.workspace.delete({ where: { id: prefs.body.activeWorkspaceId } });
    await prisma.user.delete({ where: { id: res.body.id } });
  });

  it('PATCH /me updates the profile', async () => {
    const { agent, cleanup } = await loginAsGuest();
    const res = await agent.patch('/api/v1/me').send({ fullName: 'Renamed Guest', title: 'QA' }).expect(200);
    expect(res.body).toMatchObject({ fullName: 'Renamed Guest', title: 'QA' });
    await cleanup();
  });

  it('PATCH /me/preferences updates theme and accent', async () => {
    const { agent, cleanup } = await loginAsGuest();
    const res = await agent.patch('/api/v1/me/preferences').send({ theme: 'DARK', accent: 'ROSE' }).expect(200);
    expect(res.body).toMatchObject({ theme: 'DARK', accent: 'ROSE' });
    await cleanup();
  });

  it('POST /auth/refresh rotates the access token and keeps the session valid', async () => {
    const { agent, cleanup } = await loginAsGuest();
    await agent.post('/api/v1/auth/refresh').expect(200);
    await agent.get('/api/v1/me').expect(200);
    await cleanup();
  });

  it('POST /auth/logout clears the session', async () => {
    const { agent, cleanup } = await loginAsGuest();
    await agent.post('/api/v1/auth/logout').expect(200);
    await agent.get('/api/v1/me').expect(401);
    await cleanup();
  });

  it('GET /auth/google returns 501 when OAuth credentials are not configured', () => {
    return request(app.getHttpServer()).get('/api/v1/auth/google').expect(501);
  });
});
