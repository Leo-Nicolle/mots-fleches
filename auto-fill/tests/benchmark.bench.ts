import { describe, bench, beforeAll } from 'vitest'
import { readFileSync } from 'fs'
import { unzipSync } from 'fflate'
import { DictionaryIndex, AC3Solver } from '../src/index'
import type { Direction, GridCell } from '../src/index'
import { BitSet, hasOverlap, popcountAnd } from '../src/bitset'

// ─── Setup ────────────────────────────────────────────────────────────────

function loadFrench(): string[] {
  const path = new URL('../demo/public/fr-fr.zip', import.meta.url)
  const zip = unzipSync(new Uint8Array(readFileSync(path)))
  return new TextDecoder()
    .decode(zip['dico.txt'])
    .trim()
    .split(',')
    .map(w =>
      w.trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[ '-]/g, '')
        .toUpperCase()
    )
    .filter(w => w.length >= 2)
}

function makeGrid(rows: number, cols: number, defRatio = 0.15) {
  const cells: GridCell[][] = []
  for (let y = 0; y < rows; y++) {
    const row: GridCell[] = []
    for (let x = 0; x < cols; x++)
      row.push({ x, y, definition: Math.random() < defRatio, text: '' })
    cells.push(row)
  }
  const slots: { direction: Direction; cells: { x: number; y: number }[] }[] = []
  for (let y = 0; y < rows; y++) {
    let run: { x: number; y: number }[] = []
    for (let x = 0; x <= cols; x++) {
      if (x === cols || cells[y][x].definition) {
        if (run.length > 1) slots.push({ direction: 'horizontal', cells: run })
        run = []
      } else run.push({ x, y })
    }
  }
  for (let x = 0; x < cols; x++) {
    let run: { x: number; y: number }[] = []
    for (let y = 0; y <= rows; y++) {
      if (y === rows || cells[y][x].definition) {
        if (run.length > 1) slots.push({ direction: 'vertical', cells: run })
        run = []
      } else run.push({ x, y })
    }
  }
  return { cells, slots }
}

let frWords: string[]
let dict: DictionaryIndex
let grid8: ReturnType<typeof makeGrid>
let grid13: ReturnType<typeof makeGrid>
let grid20: ReturnType<typeof makeGrid>

beforeAll(() => {
  frWords = loadFrench()
  dict = new DictionaryIndex(frWords)
  grid8 = makeGrid(8, 8)
  grid13 = makeGrid(13, 13)
  grid20 = makeGrid(20, 20)
})

// ─── Dictionary indexing ──────────────────────────────────────────────────

describe('DictionaryIndex — fr-fr', () => {
  bench('build index', () => {
    new DictionaryIndex(frWords)
  })
})

// ─── AC-3 Solver ──────────────────────────────────────────────────────────

describe('AC3Solver — 8×8', () => {
  bench('buildGraph', () => {
    const s = new AC3Solver(dict)
    s.buildGraph(grid8.cells, grid8.slots)
  })

  bench('solve', () => {
    const s = new AC3Solver(dict)
    s.buildGraph(grid8.cells, grid8.slots)
    s.solve()
  })
})

describe('AC3Solver — 13×13', () => {
  bench('buildGraph', () => {
    const s = new AC3Solver(dict)
    s.buildGraph(grid13.cells, grid13.slots)
  })

  bench('solve', () => {
    const s = new AC3Solver(dict)
    s.buildGraph(grid13.cells, grid13.slots)
    s.solve()
  })

  bench('suggest top-100 (first alive slot)', () => {
    const s = new AC3Solver(dict)
    s.buildGraph(grid13.cells, grid13.slots)
    s.solve()
    const id = grid13.slots.findIndex((_, i) => s.getDomainSize(i) > 0)
    if (id >= 0) s.suggest(id, 100)
  })
})

describe('AC3Solver — 20×20', () => {
  bench('solve', () => {
    const s = new AC3Solver(dict)
    s.buildGraph(grid20.cells, grid20.slots)
    s.solve()
  })
})

// ─── BitSet micro-benchmarks ──────────────────────────────────────────────

describe('BitSet — 60k bits', () => {
  const size = 60_000
  const a = new BitSet(size)
  const b = new BitSet(size)
  for (let i = 0; i < size; i++) {
    if (Math.random() < 0.5) a.set(i)
    if (Math.random() < 0.5) b.set(i)
  }

  bench('hasOverlap', () => { hasOverlap(a, b) })
  bench('popcountAnd', () => { popcountAnd(a, b) })
  bench('popcount', () => { a.popcount() })
  bench('andWith (clone)', () => { a.clone().andWith(b) })
})
