import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RemoteDB } from '../src/remote';

const store = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
};

describe('RemoteDB', () => {
  let db: RemoteDB;
  const get = vi.fn();
  const post = vi.fn();
  const del = vi.fn();

  beforeEach(() => {
    get.mockReset();
    post.mockReset();
    del.mockReset();
    db = new RemoteDB('http://api.test');
    db.fetcher = { get, post, delete: del } as any;
  });

  it('getGrids calls GET /grids', async () => {
    get.mockResolvedValue({ data: [] });
    await db.getGrids();
    expect(get).toHaveBeenCalledWith('/grids');
  });

  it('pushGrid posts to /grid and returns the id', async () => {
    post.mockResolvedValue({ data: 'grid-1' });
    const grid = { id: 'grid-1' } as any;
    await expect(db.pushGrid(grid)).resolves.toBe('grid-1');
    expect(post).toHaveBeenCalledWith('/grid', grid);
  });

  it('getGrid / deleteGrid use the grid id', async () => {
    get.mockResolvedValue({ data: { id: 'grid-1' } });
    await db.getGrid('grid-1');
    expect(get).toHaveBeenCalledWith('/grid/grid-1');

    del.mockResolvedValue({});
    await db.deleteGrid('grid-1');
    expect(del).toHaveBeenCalledWith('/grid/grid-1');
  });

  it('signin posts to /auth/login', async () => {
    post.mockResolvedValue({ data: { accessToken: 'a', refreshToken: 'r' } });
    await expect(db.signin('e', 'p')).resolves.toEqual({ accessToken: 'a', refreshToken: 'r' });
    expect(post).toHaveBeenCalledWith('/auth/login', { email: 'e', password: 'p' });
  });

  it('register posts to /auth/join', async () => {
    post.mockResolvedValue({ data: {} });
    await db.register('e', 'p', 'pseudo', 'tt');
    expect(post).toHaveBeenCalledWith('/auth/join', { email: 'e', password: 'p', pseudo: 'pseudo', turnstileToken: 'tt' });
  });

  it('requestPasswordReset / resetPassword hit the auth endpoints', async () => {
    post.mockResolvedValue({ data: {} });
    await db.requestPasswordReset('e');
    expect(post).toHaveBeenCalledWith('/auth/forgot-password', { email: 'e', turnstileToken: undefined });

    await db.resetPassword('tok', 'pw');
    expect(post).toHaveBeenCalledWith('/auth/reset-password', { token: 'tok', password: 'pw' });
  });

  it('shareGrid / unshareGrid use the group + grid ids', async () => {
    post.mockResolvedValue({ data: {} });
    del.mockResolvedValue({});
    await db.shareGrid(3, 'g1');
    expect(post).toHaveBeenCalledWith('/group/3/grid/g1/share');
    await db.unshareGrid(3, 'g1');
    expect(del).toHaveBeenCalledWith('/group/3/grid/g1/share');
  });

  it('shareBook / shareStyle use their endpoints', async () => {
    post.mockResolvedValue({ data: {} });
    await db.shareBook(1, 'b1');
    expect(post).toHaveBeenCalledWith('/group/1/book/b1/share');
    await db.shareStyle(1, 's1');
    expect(post).toHaveBeenCalledWith('/group/1/style/s1/share');
  });

  it('isSignedIn returns false without a token', async () => {
    await expect(db.isSignedIn()).resolves.toBe(false);
  });

  it('isSignedIn checks /profile when a token is set', async () => {
    db.setToken('tok');
    get.mockResolvedValue({ data: {} });
    await expect(db.isSignedIn()).resolves.toBe(true);
    expect(get).toHaveBeenCalledWith('/profile');
  });
});
