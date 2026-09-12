import { describe, it, expect } from 'vitest';
import { getD, getTransform } from '../../src/js/paths';

describe('paths', () => {
  it('getD renders a cross for "none"', () => {
    expect(getD('none')).toBe('M 0 0 L 90 90 M 0 90 L 90 0');
  });

  it('getD renders a straight arrow for "right"/"down"', () => {
    expect(getD('right')).toBe('M 0 0 L 90 0 M 65 -25 L 90 0 M 65 25 L 90 0');
    expect(getD('down')).toBe(getD('right'));
  });

  it('getD renders a corner arrow for "rightdown"/"downright"', () => {
    expect(getD('rightdown')).toBe(getD('downright'));
    expect(getD('rightdown')).toContain('M 0 0 L 75 0 75 100');
  });

  it('getTransform rotates right arrows and turns down arrows', () => {
    expect(getTransform('right')).toContain('rotate(180deg)');
    expect(getTransform('down')).toContain('rotate(90deg)');
  });
});
