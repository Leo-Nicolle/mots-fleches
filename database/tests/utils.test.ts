import { describe, it, expect } from 'vitest';
import { mergeOptionsWithDefaults } from '../src/utils';
import type { GridStyle, SolutionStyle } from 'grid';

describe('mergeOptionsWithDefaults', () => {
  it('fills missing fields for a regular style', () => {
    const partial = { id: 'custom' } as unknown as GridStyle;
    const merged = mergeOptionsWithDefaults(partial) as GridStyle;
    expect(merged.id).toBe('custom');
    expect(merged.grid.cellSize).toBe(54);
    expect(merged.name).toBeDefined();
  });

  it('preserves the caller-provided value over the default', () => {
    const partial = { id: 'custom', grid: { cellSize: 30 } } as unknown as GridStyle;
    const merged = mergeOptionsWithDefaults(partial) as GridStyle;
    expect(merged.grid.cellSize).toBe(30);
  });

  it('uses the solution defaults for solution styles', () => {
    const partial = { id: 'sol', isSolution: true } as unknown as SolutionStyle;
    const merged = mergeOptionsWithDefaults(partial) as SolutionStyle;
    expect(merged.id).toBe('sol');
    expect(merged.isSolution).toBe(true);
    expect(merged.grids).toBeDefined();
    expect(merged.pagination).toBeDefined();
  });
});
