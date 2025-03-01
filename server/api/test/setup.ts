import { vi } from 'vitest';

// Mock prismaClient globally
vi.mock('../src/prisma', () => import('./mocks/prisma'));
