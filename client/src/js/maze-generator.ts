import { Cell, Grid, } from "grid";

type Place = {
  y: number;
  x: number;
  lengthLeft: number;
  lengthRight: number;
  lengthBottom: number;
  lengthTop: number;
  lengthH: number;
  lengthV: number;
};

export function getLength({ vec, cells, pos }: {
  vec: { x: number; y: number };
  cells: Cell[][];
  pos: { x: number; y: number };
}) {
  let length = -1;
  let { x, y } = pos;
  while (cells[y] && cells[y][x] && !cells[y][x].definition) {
    length++;
    x += vec.x;
    y += vec.y;
  }
  return length;
}

function getDistribution(grid: Grid, min: number, max: number) {
  const visitedH = new Set<string>();
  const visitedV = new Set<string>();
  const distribution: Record<string, number> = new Array(max - min + 1).fill(0).reduce((acc, _, i) => {
    acc[i + min] = 0;
    return acc;
  }, {} as Record<string, number>);
  const { rows, cols, cells } = grid;
  let total = 0;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const id = `${i}-${j}`;
      if (visitedH.has(id) || cells[i][j].definition) continue;
      const bounds = grid.getBounds({ x: j, y: i }, 'horizontal');
      if (!bounds.length) continue;
      for (let k = 0; k < bounds.length; k++) {
        visitedH.add(`${bounds.cells[k].y}-${bounds.cells[k].x}`);
      }
      if (!distribution[bounds.length]) {
        distribution[bounds.length] = 0;
      }
      distribution[bounds.length] += 1;
      total++;
    }
  }
  for (let j = 0; j < cols; j++) {
    for (let i = 0; i < rows; i++) {
      const id = `${i}-${j}`;
      if (visitedV.has(id) || cells[i][j].definition) continue;
      const bounds = grid.getBounds({ x: j, y: i }, 'vertical');
      if (!bounds.length) continue;
      for (let k = 0; k < bounds.length; k++) {
        visitedH.add(`${bounds.cells[k].y}-${bounds.cells[k].x}`);
      }
      if (!distribution[bounds.length]) {
        distribution[bounds.length] = 0;
      }
      distribution[bounds.length] += 1;
      total++;
    }
  }
  const maxD = Math.max(...Object.keys(distribution).map(e => +e));
  [0, min].fill(0).forEach((_, i) => {
    delete distribution[i];
  });
  new Array(Math.max(max, maxD) - Math.min(max, maxD)).fill(0).forEach((_, i) => {
    delete distribution[i + Math.min(max, maxD)];
  });

  return Object.entries(distribution).reduce((acc, [key, value]) => {
    acc[key] = value / total;
    return acc;
  }, {} as Record<string, number>);
}

/**
 * Place a definition cell in the grid, and tries to 
 * make the distribution of the lengths of the words
 * as close as possible to the required one
 * Not too sure it is the right way of randomizing
 * @param param0 
 */
function placeDefinition({ scaledDistib, grid, minWord, maxWord, allowed }: {
  scaledDistib: Record<string, number>;
  minWord: number;
  maxWord: number;
  grid: Grid;
  allowed?: (x: number, y: number) => boolean;
}) {
  const { rows, cols, cells } = grid;
  const canCut = allowed || (() => true);
  const lengths = new Array(rows).fill(0)
    .map((_, y) => new Array(cols).fill(0)
      .map((cell, x) => {
        if (cells[y][x].definition || !canCut(x, y)) return;
        const lengthLeft = getLength({ vec: { x: -1, y: 0 }, cells, pos: { x, y } });
        const lengthRight = getLength({ vec: { x: 1, y: 0 }, cells, pos: { x, y } });
        const lengthTop = getLength({ vec: { x: 0, y: -1 }, cells, pos: { x, y } });
        const lengthBottom = getLength({ vec: { x: 0, y: 1 }, cells, pos: { x, y } });
        const lengthH = lengthLeft + lengthRight + 1;
        const lengthV = lengthTop + lengthBottom + 1;
        return {
          y,
          x,
          lengthLeft,
          lengthRight,
          lengthBottom,
          lengthTop,
          lengthH,
          lengthV,
        };
      }))
    .reduce((flat, row) => flat.concat(row), [])
    .filter(e => e) as Place[];

  // compute the actual distribution
  const actDistrib = getDistribution(grid, minWord, maxWord);
  // compute the weights, heavier => would make the distribution closer to the required one
  // => more likely to be cut 
  const weights = lengths.map(e => {
    // actual length probas: closer to required distrib => lower
    const weightIfCut = [
      e.lengthLeft,
      e.lengthRight,
      e.lengthTop,
      e.lengthBottom,
    ]
      .map(length => (scaledDistib[length] || 0) - (actDistrib[length] || 0))
      //diff is in [-1;1], we want [0;1]
      .reduce((acc, diff) => acc + (diff + 1)/2, 0)/4;

    const weightIfNotCut = [
      e.lengthH,
      e.lengthV,
    ]
      .map(length => (actDistrib[length] || 0) - (scaledDistib[length] || 0))
      .reduce((acc, diff) => acc + (diff+1)/2, 0)/2;

    const weight = weightIfCut + weightIfNotCut;
    const impossible = e.lengthLeft < minWord
      || e.lengthTop < minWord
      || (e.x < cols - 1 && e.lengthRight < minWord)
      || (e.y < rows - 1 && e.lengthBottom < minWord)
      || (e.x == cols - 1 && e.y === rows - 1);

    return {
      x: e.x,
      y: e.y,
      weight: weight * (1 - +impossible)
    };
  }).sort((a, b) => a.weight - b.weight);

  const totalWeight = weights.reduce((acc, p) => acc + p.weight, 0);
  const chosenCut = Math.random() * totalWeight;
  const cut = weights.reduce((acc, e) => {
    if (acc.chosen) return acc;
    acc.total += e.weight;
    // @ts-ignore
    if (acc.total > chosenCut) acc.chosen = e;
    return acc;
  }, { total: 0, chosen: null }).chosen;
  if (cut) {
    grid.setDefinition(cut, true);
  }
}

/**
 * Scale a word-length distribution to probabilities in [0;1], limited to a max length.
 */
function scaleDistribution(distribution: [number, number][], maxLength: number): Record<string, number> {
  const total = distribution
    .slice(2, maxLength + 1)
    .reduce((acc, [_, e]) => acc + e, 0);
  return distribution
    .slice(2, maxLength + 1)
    .reduce((acc, [key, value]) => {
      acc[key] = value / total;
      return acc;
    }, {} as Record<string, number>);
}

export default function generate({ grid, distribution }: {
  distribution: [number, number][];
  grid: Grid
}) {
  const minWord = 2;
  const maxWord = Math.max(...distribution.map(([l]) => l));

  const { rows, cols } = grid;
  const scaledDistib = scaleDistribution(distribution, Math.max(rows, cols));

  for (let i = 0; i < cols; i += 2) {
    grid.setDefinition({ x: i, y: 0 }, true);
  }
  for (let i = 0; i < rows; i += 2) {
    grid.setDefinition({ x: 0, y: i }, true);
  }
  for (let i = 0; i < grid.rows; i++) {
    placeDefinition({ minWord, scaledDistib, grid, maxWord });
  }
  return grid;
}

/**
 * Extend the definition pattern of a resized grid onto its newly added
 * rows/columns, while leaving the pre-existing cells untouched.
 * @param grid the already-resized grid
 * @param distribution word-length distribution
 * @param oldRows number of rows before the resize
 * @param oldCols number of columns before the resize
 */
export function generateExtension({ grid, distribution, oldRows, oldCols }: {
  distribution: [number, number][];
  grid: Grid;
  oldRows: number;
  oldCols: number;
}) {
  const minWord = 2;
  const maxWord = Math.max(...distribution.map(([l]) => l));
  const { rows, cols } = grid;
  const scaledDistib = scaleDistribution(distribution, Math.max(rows, cols));

  const allowed = (x: number, y: number) => x >= oldCols || y >= oldRows;

  // Continue the staircase pattern on the newly added top-row / left-column cells.
  for (let x = Math.max(oldCols, 0); x < cols; x++) {
    if (x % 2 === 0) grid.setDefinition({ x, y: 0 }, true);
  }
  for (let y = Math.max(oldRows, 0); y < rows; y++) {
    if (y % 2 === 0) grid.setDefinition({ x: 0, y }, true);
  }

  // Estimate how many definition cells to add from the existing density.
  let defs = 0;
  for (let y = 0; y < oldRows; y++) {
    for (let x = 0; x < oldCols; x++) {
      if (grid.cells[y][x].definition) defs++;
    }
  }
  const oldArea = Math.max(1, oldRows * oldCols);
  const newArea = rows * cols - oldRows * oldCols;
  const target = Math.round((defs / oldArea) * newArea);

  for (let i = 0; i < target; i++) {
    placeDefinition({ minWord, scaledDistib, grid, maxWord, allowed });
  }
  return grid;
}
