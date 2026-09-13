import { describe, it, expect } from 'vitest';
import { Grid } from '../src/Grid';
import {
  parse,
  format,
  cellWidth,
  borderWidth,
  outerBorderWidth,
  cellAndBorderWidth,
  gridWidth,
  gridHeight,
  gridTotalWidth,
  gridTotalHeight,
  getLines,
  splitIndex,
  getLineCaseIndex,
  getOffsetY,
  arrowPositions,
  splitPosition,
  duplicate,
  newStyle,
  getWords,
  getAllWords,
  getDefinitions,
} from '../src/utils';
import { defaultStyles, defaultLineSpacings } from '../src/types';
import type { Cell } from '../src/types';

function defCell(text: string): Cell {
  return { ...Grid.newCell(0, 0), definition: true, text };
}

describe('parse / format', () => {
  it('parses value and unit', () => {
    expect(parse('10cm')).toEqual([10, 'cm']);
    expect(parse('3.5pt')).toEqual([3.5, 'pt']);
  });

  it('formats value and unit', () => {
    expect(format(10, 'cm')).toBe('10cm');
  });
});

describe('dimension helpers', () => {
  it('reads sizes from a style', () => {
    expect(cellWidth(defaultStyles)).toBe(54);
    expect(borderWidth(defaultStyles)).toBe(1);
    expect(outerBorderWidth(defaultStyles)).toBe(2);
    expect(cellAndBorderWidth(defaultStyles)).toBe(55);
  });

  it('computes grid dimensions', () => {
    const g = new Grid(3, 4);
    expect(gridWidth(g, defaultStyles)).toBe(4 * 54 + 3 * 1);
    expect(gridHeight(g, defaultStyles)).toBe(3 * 54 + 2 * 1);
    expect(gridTotalWidth(g, defaultStyles)).toBe(gridWidth(g, defaultStyles) + 4);
    expect(gridTotalHeight(g, defaultStyles)).toBe(gridHeight(g, defaultStyles) + 4);
  });
});

describe('definition text helpers', () => {
  it('splits lines across \n and \n\n', () => {
    expect(getLines(defCell('a\n\nb'))).toEqual(['a', 'b']);
    expect(getLines(defCell('a\nb\n\nc'))).toEqual(['a', 'b', 'c']);
  });

  it('computes the split index', () => {
    expect(splitIndex(defCell('a\n\nb'))).toBe(1);
    expect(splitIndex(defCell('a\nb\n\nc'))).toBe(2);
    expect(splitIndex(defCell('a\nb'))).toBe(0);
  });

  it('classifies line cases', () => {
    expect(getLineCaseIndex('word')).toBe(0);
    expect(getLineCaseIndex('a\n\nb')).toBe(4);
  });

  it('resolves offsets from line case', () => {
    expect(getOffsetY('word', defaultLineSpacings)).toEqual([0]);
  });

  it('computes arrow and split positions', () => {
    const positions = arrowPositions(defCell('a\n\nb'));
    expect(positions).toHaveLength(3);
    expect(positions[2]).toEqual({ x: 0.5, y: 1 });
    expect(splitPosition(defCell('a\n\nb'))).toBe(0.5);
  });
});

describe('style duplication', () => {
  it('duplicate creates a new id', () => {
    const copy = duplicate(defaultStyles);
    expect(copy.id).not.toBe(defaultStyles.id);
    expect(copy.grid.cellSize).toBe(defaultStyles.grid.cellSize);
  });

  it('newStyle duplicates the default style', () => {
    const style = newStyle();
    expect(style.id).not.toBe('default');
  });
});

describe('getWords / getAllWords / getDefinitions', () => {
  it('collects filled words and their positions', () => {
    const g = new Grid(1, 3);
    g.setWord('CAT', { x: 0, y: 0 }, 'horizontal');
    const { words, wordsAndBounds } = getWords(g);
    expect(words.has('CAT')).toBe(true);
    expect(
      wordsAndBounds.some((w) => w.word === 'CAT' && w.direction === 'horizontal' && w.start.x === 0)
    ).toBe(true);
  });

  it('getAllWords unions words across grids', () => {
    const g1 = new Grid(1, 3);
    g1.setWord('CAT', { x: 0, y: 0 }, 'horizontal');
    const g2 = new Grid(1, 3);
    g2.setWord('DOG', { x: 0, y: 0 }, 'horizontal');
    const all = getAllWords([g1, g2]);
    expect(all.has('CAT')).toBe(true);
    expect(all.has('DOG')).toBe(true);
  });

  it('getDefinitions maps words to their definition text', () => {
    // word "CAT" at (0,0) horizontal with a definition cell at (0, -1) is
    // out of bounds, so no definition is found — sanity check empty case.
    const g = new Grid(1, 3);
    g.setWord('CAT', { x: 0, y: 0 }, 'horizontal');
    const defs = getDefinitions(g);
    expect(defs.size).toBe(0);
  });
});
