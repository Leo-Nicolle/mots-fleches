import { describe, it, expect } from 'vitest';
import { cantor, reverseCantor } from '../../src/worker/utils/math';

describe('cantor pairing', () => {
  it('computes known values', () => {
    expect(cantor(0, 0)).toBe(0);
    expect(cantor(1, 0)).toBe(1);
    expect(cantor(0, 1)).toBe(2);
    expect(cantor(1, 1)).toBe(4);
  });

  it('round-trips through reverseCantor', () => {
    const pairs = [[0, 0], [1, 0], [0, 1], [3, 7], [10, 2], [123, 456], [0, 100]];
    for (const [x, y] of pairs) {
      expect(reverseCantor(cantor(x, y))).toEqual({ x, y });
    }
  });
});
