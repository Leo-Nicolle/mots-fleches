import { describe, it, expect } from 'vitest';
import { StringBS } from '../../src/worker/utils/string-bs';

describe('StringBS', () => {
  const words = ['APPLE', 'BANANA', 'CHERRY', 'DATE', 'ELDERBERRY'];
  const sorted = [0, 1, 2, 3, 4];

  it('finds the start and end indices for a letter prefix', () => {
    const bs = new StringBS(words, sorted);
    const start = bs.findStartIdx('C'.charCodeAt(0), 0, 0, words.length - 1);
    const end = bs.findEndIdx('C'.charCodeAt(0), 0, 0, words.length - 1);
    expect(start).toBe(2);
    expect(end).toBe(2);
  });

  it('returns a full range for a leading letter', () => {
    const bs = new StringBS(words, sorted);
    expect(bs.findStartIdx('A'.charCodeAt(0), 0, 0, words.length - 1)).toBe(0);
    expect(bs.findEndIdx('E'.charCodeAt(0), 0, 0, words.length - 1)).toBe(words.length - 1);
  });

  it('byLengthStart/End narrow by word length', () => {
    const byLength = new StringBS(['A', 'AA', 'AAA', 'AAAA'], [0, 1, 2, 3]);
    const start = byLength.byLengthStart(3, 0, 3);
    const end = byLength.byLengthEnd(3, 0, 3);
    expect(start).toBe(2);
    expect(end).toBe(2);
  });
});
