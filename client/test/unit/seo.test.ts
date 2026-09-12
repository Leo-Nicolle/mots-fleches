import { describe, it, expect, beforeEach } from 'vitest';
import { applySeo, applySeoForRoute } from '../../src/js/seo';

describe('seo', () => {
  beforeEach(() => {
    document.head.querySelectorAll('meta, link[rel="canonical"]').forEach((el) => el.remove());
  });

  it('applySeo sets title and description meta', () => {
    applySeo({ title: 'My Title', description: 'My Description' }, '/grids');
    expect(document.title).toBe('My Title');
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe('My Description');
  });

  it('applySeo writes og and twitter tags plus canonical', () => {
    applySeo({ title: 'T', description: 'D' }, '/home');
    expect(document.querySelector('meta[property="og:title"]')?.getAttribute('content')).toBe('T');
    expect(document.querySelector('meta[name="twitter:description"]')?.getAttribute('content')).toBe('D');
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://motsflex.com/home');
  });

  it('applySeoForRoute uses the default title for unknown routes', () => {
    applySeoForRoute('unknown-route', '/x');
    expect(document.title).toContain('MotsFlex');
  });

  it('applySeoForRoute uses route-specific metadata', () => {
    applySeoForRoute('login', '/login');
    expect(document.title).toContain('Se connecter');
  });
});
