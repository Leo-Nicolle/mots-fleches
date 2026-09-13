import { describe, it, expect } from 'vitest';
import { Grid, nullCell, isSplited } from '../src/Grid';
import type { Cell } from '../src/types';

describe('Grid construction', () => {
  it('builds a rows x cols grid of fresh cells', () => {
    const g = new Grid(2, 3);
    expect(g.rows).toBe(2);
    expect(g.cols).toBe(3);
    expect(g.cells).toHaveLength(2);
    expect(g.cells[0]).toHaveLength(3);
    expect(g.cells[1]).toHaveLength(3);
    expect(g.cells[0][0]).toMatchObject({ x: 0, y: 0, definition: false, text: '' });
    expect(g.cells[1][2]).toMatchObject({ x: 2, y: 1 });
  });

  it('defaults id to a uuid, styleId to default', () => {
    const g = new Grid(1, 1);
    expect(g.id).toBeTruthy();
    expect(g.styleId).toBe('default');
    expect(g.comment).toBe('');
    expect(g.title).toBe('');
    expect(typeof g.created).toBe('number');
  });

  it('honours a provided id', () => {
    const g = new Grid(1, 1, 'my-id');
    expect(g.id).toBe('my-id');
  });
});

describe('Grid.newCell / nullCell', () => {
  it('newCell returns a fully initialized cell', () => {
    const c = Grid.newCell(1, 2);
    expect(c).toEqual({
      x: 1,
      y: 2,
      definition: false,
      highlighted: false,
      spaceV: false,
      spaceH: false,
      arrows: [],
      suggestion: '',
      text: '',
    });
  });

  it('nullCell sits outside the grid', () => {
    expect(nullCell.x).toBe(-1);
    expect(nullCell.y).toBe(-1);
  });
});

describe('isValid / isDefinition / getCell', () => {
  const g = new Grid(2, 2);

  it('validates in-bounds coordinates', () => {
    expect(g.isValid({ x: 0, y: 0 })).toBe(true);
    expect(g.isValid({ x: 1, y: 1 })).toBe(true);
    expect(g.isValid({ x: -1, y: 0 })).toBe(false);
    expect(g.isValid({ x: 0, y: 2 })).toBe(false);
    expect(g.isValid({ x: 2, y: 0 })).toBe(false);
  });

  it('isDefinition reflects the cell definition flag', () => {
    expect(g.isDefinition({ x: 0, y: 0 })).toBe(false);
    g.setDefinition({ x: 0, y: 0 }, true);
    expect(g.isDefinition({ x: 0, y: 0 })).toBe(true);
    expect(g.isDefinition({ x: 99, y: 99 })).toBe(false);
  });

  it('getCell returns the cell', () => {
    expect(g.getCell({ x: 1, y: 0 })).toBe(g.cells[0][1]);
  });
});

describe('resize / clear', () => {
  it('resize preserves overlapping cells and pads the rest', () => {
    const g = new Grid(2, 2);
    g.setText({ x: 0, y: 0 }, 'A');
    g.resize(3, 3);
    expect(g.rows).toBe(3);
    expect(g.cols).toBe(3);
    expect(g.cells).toHaveLength(3);
    expect(g.cells[0][0].text).toBe('A');
    expect(g.cells[2][2]).toMatchObject({ x: 2, y: 2 });
  });

  it('clear resets every cell', () => {
    const g = new Grid(2, 2);
    g.setText({ x: 0, y: 0 }, 'A');
    g.clear();
    expect(g.cells[0][0].text).toBe('');
    expect(g.cells[0][0].definition).toBe(false);
  });
});

describe('setDefinition / setText / setWord', () => {
  it('setDefinition true resets text and sets none arrows', () => {
    const g = new Grid(2, 2);
    g.setDefinition({ x: 0, y: 0 }, true);
    expect(g.cells[0][0].definition).toBe(true);
    expect(g.cells[0][0].arrows).toEqual(['none', 'none', 'none']);
  });

  it('setDefinition false clears arrows', () => {
    const g = new Grid(2, 2);
    g.setDefinition({ x: 0, y: 0 }, true);
    g.setDefinition({ x: 0, y: 0 }, false);
    expect(g.cells[0][0].definition).toBe(false);
    expect(g.cells[0][0].arrows).toEqual([]);
  });

  it('setText keeps only the last char for non-definition cells', () => {
    const g = new Grid(1, 1);
    g.setText({ x: 0, y: 0 }, 'ABC');
    expect(g.cells[0][0].text).toBe('C');
  });

  it('setText keeps the whole text for definition cells', () => {
    const g = new Grid(1, 1);
    g.setDefinition({ x: 0, y: 0 }, true);
    g.setText({ x: 0, y: 0 }, 'ABC');
    expect(g.cells[0][0].text).toBe('ABC');
  });

  it('setWord writes one letter per cell horizontally and clears suggestions', () => {
    const g = new Grid(1, 3);
    g.suggest(['XXX'], [{ x: 0, y: 0 }], ['horizontal']);
    g.setWord('CAT', { x: 0, y: 0 }, 'horizontal');
    expect(g.cells[0][0].text).toBe('C');
    expect(g.cells[0][1].text).toBe('A');
    expect(g.cells[0][2].text).toBe('T');
    expect(g.cells[0][0].suggestion).toBe('');
  });

  it('setWord writes vertically', () => {
    const g = new Grid(3, 1);
    g.setWord('DOG', { x: 0, y: 0 }, 'vertical');
    expect(g.cells[0][0].text).toBe('D');
    expect(g.cells[1][0].text).toBe('O');
    expect(g.cells[2][0].text).toBe('G');
  });
});

describe('arrows', () => {
  it('setArrow sets the arrow on the cell', () => {
    const g = new Grid(2, 2);
    g.setArrow({ x: 0, y: 0 }, 1, 'down');
    expect(g.cells[0][0].arrows[1]).toBe('down');
  });

  it('static setArrow initializes a null arrows array', () => {
    const cell = Grid.newCell(0, 0) as unknown as { arrows: unknown };
    cell.arrows = null;
    Grid.setArrow(cell as never, 1, 'down');
    expect(cell.arrows).toEqual(['none', 'down', 'none']);
  });

  it('setArrow ignores out-of-bounds coordinates', () => {
    const g = new Grid(2, 2);
    g.setArrow({ x: 99, y: 99 }, 0, 'right');
    expect(g.cells[0][0].arrows).toEqual([]);
  });
});

describe('directions and movement', () => {
  it('getDirVec maps horizontal/vertical', () => {
    expect(Grid.getDirVec('horizontal')).toMatchObject({ x: 1, y: 0 });
    expect(Grid.getDirVec('vertical')).toMatchObject({ x: 0, y: 1 });
  });

  it('perpendicular swaps direction', () => {
    expect(Grid.perpendicular('horizontal')).toBe('vertical');
    expect(Grid.perpendicular('vertical')).toBe('horizontal');
  });

  it('equal compares coordinates', () => {
    expect(Grid.equal({ x: 1, y: 2 }, { x: 1, y: 2 })).toBe(true);
    expect(Grid.equal({ x: 1, y: 2 }, { x: 2, y: 1 })).toBe(false);
  });

  it('increment/decrement move through cells and return nullCell out of bounds', () => {
    const g = new Grid(1, 2);
    expect(g.increment({ x: 0, y: 0 }, 'horizontal')).toBe(g.cells[0][1]);
    expect(g.increment({ x: 1, y: 0 }, 'horizontal')).toBe(nullCell);
    expect(g.decrement({ x: 1, y: 0 }, 'horizontal')).toBe(g.cells[0][0]);
    expect(g.decrement({ x: 0, y: 0 }, 'horizontal')).toBe(nullCell);
  });
});

describe('getBounds', () => {
  it('returns the full row for an open horizontal word', () => {
    const g = new Grid(1, 3);
    const bounds = g.getBounds({ x: 0, y: 0 }, 'horizontal');
    expect(bounds.length).toBe(3);
    expect(bounds.start).toMatchObject({ x: 0, y: 0 });
    expect(bounds.end).toMatchObject({ x: 2, y: 0 });
    expect(bounds.cells).toHaveLength(3);
  });

  it('returns empty bounds for a definition cell', () => {
    const g = new Grid(2, 2);
    g.setDefinition({ x: 0, y: 0 }, true);
    const bounds = g.getBounds({ x: 0, y: 0 }, 'horizontal');
    expect(bounds.length).toBe(0);
    expect(bounds.cells).toHaveLength(0);
  });

  it('splits a row at a definition cell', () => {
    const g = new Grid(1, 3);
    g.setDefinition({ x: 1, y: 0 }, true);
    const left = g.getBounds({ x: 0, y: 0 }, 'horizontal');
    const right = g.getBounds({ x: 2, y: 0 }, 'horizontal');
    expect(left.length).toBe(1);
    expect(right.length).toBe(1);
  });
});

describe('getWords', () => {
  it('enumerates horizontal and vertical words', () => {
    const g = new Grid(2, 2);
    expect(g.getWords('horizontal')).toHaveLength(2);
    expect(g.getWords('vertical')).toHaveLength(2);
  });
});

describe('serialize / unserialize', () => {
  it('round-trips through a JSON string', () => {
    const g = new Grid(2, 2, 'id-1');
    g.title = 'T';
    g.comment = 'C';
    g.setText({ x: 0, y: 0 }, 'A');
    const restored = Grid.unserialize(JSON.stringify(g.serialize()));
    expect(restored.id).toBe('id-1');
    expect(restored.title).toBe('T');
    expect(restored.comment).toBe('C');
    expect(restored.rows).toBe(2);
    expect(restored.cols).toBe(2);
    expect(restored.cells[0][0].text).toBe('A');
  });

  it('unserialize accepts a GridState object', () => {
    const g = new Grid(1, 1, 'id-2');
    const restored = Grid.unserialize(g.serialize());
    expect(restored.id).toBe('id-2');
  });

  it('recovers rows/cols from cells when they are corrupted', () => {
    const g = new Grid(2, 3);
    const state = g.serialize();
    const corrupted = { ...state, rows: 0, cols: 0 };
    const restored = Grid.unserialize(corrupted);
    expect(restored.rows).toBe(2);
    expect(restored.cols).toBe(3);
  });
});

describe('check', () => {
  it('flags an incomplete word', () => {
    const g = new Grid(1, 3);
    g.setText({ x: 0, y: 0 }, 'C');
    const validity = g.check(new Map());
    const problems = Object.values(validity.horizontal);
    expect(problems.map((p) => p.problem)).toContain('incomplete');
  });

  it('flags an unknown complete word', () => {
    const g = new Grid(1, 3);
    g.setWord('CAT', { x: 0, y: 0 }, 'horizontal');
    const validity = g.check(new Map());
    const problems = Object.values(validity.horizontal);
    expect(problems.map((p) => p.problem)).toContain('unknown');
  });
});

describe('isSplited', () => {
  it('detects a split definition cell', () => {
    const cell: Cell = Grid.newCell(0, 0);
    cell.text = 'a\n\nb';
    expect(isSplited(cell)).toBe(true);
    cell.text = 'a\nb';
    expect(isSplited(cell)).toBe(false);
  });
});
