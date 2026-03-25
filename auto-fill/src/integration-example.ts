/**
 * Integration example: how to wire AC3Solver into the existing
 * mots-fleches Grid interface.
 *
 * Your existing code calls:
 *   grid.getWords('horizontal') / grid.getWords('vertical')
 * which returns WordBounds with { cells: Cell[], start, length }.
 *
 * This file shows the glue code.
 */

import { DictionaryIndex } from "./dictionary-index";
import { AC3Solver, Direction, GridCell, SolverResult, ScoredWord } from "./ac3-solver";

// ─── Adapt to your existing types ───────────────────────────────────────

// Your Grid type (simplified — adjust imports to match your actual types)
interface Cell {
  x: number;
  y: number;
  definition: boolean;
  text: string;
}

interface WordBounds {
  cells: Cell[];
  start: { x: number; y: number };
  length: number;
}

interface Grid {
  cells: Cell[][];
  getWords(direction: "horizontal" | "vertical"): WordBounds[];
}

// ─── One-time setup ─────────────────────────────────────────────────────

let dictIndex: DictionaryIndex | null = null;

/**
 * Call once at startup with your full word list.
 * This builds the BitSet indexes (~50ms for 440k words).
 */
export function initDictionary(words: string[]): void {
  dictIndex = new DictionaryIndex(words);
}

// ─── Per-solve call ─────────────────────────────────────────────────────

/**
 * Replaces getCellProbas / getCellProbasAccurate.
 *
 * Returns the solver instance so you can call suggest() on individual slots.
 */
export function solveGrid(grid: Grid, bailCheck?: () => boolean) {
  if (!dictIndex) throw new Error("Call initDictionary() first");

  const solver = new AC3Solver(dictIndex);

  // Convert your grid's word bounds into the format the solver expects
  const rawSlots: { direction: Direction; cells: { x: number; y: number }[] }[] = [];

  for (const dir of ["horizontal", "vertical"] as const) {
    for (const bounds of grid.getWords(dir)) {
      if (bounds.length < 2) continue;
      rawSlots.push({
        direction: dir,
        cells: bounds.cells.map((c) => ({ x: c.x, y: c.y })),
      });
    }
  }

  // Map your cells into GridCell[][]
  const cells: GridCell[][] = grid.cells.map((row) =>
    row.map((c) => ({
      x: c.x,
      y: c.y,
      definition: c.definition,
      text: c.text,
    }))
  );

  solver.buildGraph(cells, rawSlots);
  const result = solver.solve(bailCheck);

  return { solver, result };
}

// ─── Usage example ──────────────────────────────────────────────────────

/*
// In your worker:

import { dico } from './dico';

// Once at startup:
initDictionary(dico.words);

// When the grid changes:
const { solver, result } = solveGrid(grid);

// result.cells[y][x].possibilities = { A: 42, B: 3, ... }
// result.hasDeadEnd = true/false
// result.deadSlots = [3, 7]  (slot IDs with no valid words)

// Get ranked suggestions for slot 0:
const suggestions = solver.suggest(0, 50);
// [{ word: "MAISON", score: 12.4 }, { word: "RAISON", score: 11.8 }, ...]

// Get all valid words for slot 5:
const words = solver.getWords(5);
// ["CHAT", "CHAI", "CHAR", ...]

// Map a slot ID back to grid coordinates:
const slot = result.slots[0];
// slot.cells = [{ x: 1, y: 0 }, { x: 2, y: 0 }, ...]
// slot.direction = "horizontal"
// slot.pattern = "M**S*N"
*/
