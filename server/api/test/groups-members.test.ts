import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { buildApp, createUser, login } from './helpers';

const app = buildApp();

const OWNER = 'owner@groups.test';
const MEMBER = 'member@groups.test';
const OUTSIDER = 'outsider@groups.test';

let ownerToken = '';
let memberToken = '';
let groupId = 0;
let memberUserId = 0;

describe('groups and members', () => {
  beforeAll(async () => {
    await createUser(OWNER);
    await createUser(MEMBER);
    await createUser(OUTSIDER);
    [ownerToken, memberToken] = await Promise.all([
      login(app, OWNER),
      login(app, MEMBER),
    ]);
  });

  it('creates a group', async () => {
    const res = await request(app)
      .post('/api/group')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ name: 'MembersGroup', description: 'desc' });
    expect(res.status).toBe(201);
    groupId = res.body.id;
  });

  it('rejects a duplicate group name', async () => {
    const res = await request(app)
      .post('/api/group')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ name: 'MembersGroup' });
    expect(res.status).toBe(409);
  });

  it('lists groups the owner belongs to', async () => {
    const res = await request(app)
      .get('/api/groups')
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.map((g: { name: string }) => g.name)).toContain('MembersGroup');
  });

  it('adds a member by email', async () => {
    const res = await request(app)
      .post(`/api/group/${groupId}/member`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ email: MEMBER });
    expect(res.status).toBe(201);
    memberUserId = res.body.user_id;
  });

  it('rejects adding an unknown user', async () => {
    const res = await request(app)
      .post(`/api/group/${groupId}/member`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ email: 'ghost@groups.test' });
    expect(res.status).toBe(404);
  });

  it('rejects adding an existing member', async () => {
    const res = await request(app)
      .post(`/api/group/${groupId}/member`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ email: MEMBER });
    expect(res.status).toBe(409);
  });

  it('forbids a non-owner from adding members', async () => {
    const res = await request(app)
      .post(`/api/group/${groupId}/member`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ email: OUTSIDER });
    expect(res.status).toBe(403);
  });

  it('lets the owner update the group', async () => {
    const res = await request(app)
      .put(`/api/group/${groupId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ name: 'MembersGroupRenamed' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('MembersGroupRenamed');
  });

  it('forbids a non-owner from updating the group', async () => {
    const res = await request(app)
      .put(`/api/group/${groupId}`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ name: 'Hijack' });
    expect(res.status).toBe(403);
  });

  it('lets the owner change a member role', async () => {
    const res = await request(app)
      .put(`/api/group/${groupId}/member/${memberUserId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ role: 'admin' });
    expect(res.status).toBe(200);
    expect(res.body.role).toBe('admin');
  });

  it('lets the owner remove a member', async () => {
    const res = await request(app)
      .delete(`/api/group/${groupId}/member/${memberUserId}`)
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(res.status).toBe(200);
  });

  it('lets the owner delete the group', async () => {
    const res = await request(app)
      .delete(`/api/group/${groupId}`)
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(res.status).toBe(200);
  });
});
