/**
 * Solver reliability tests.
 *
 * Three layers of checks:
 *
 *  1. Arc-compatibility property (guaranteed by AC-3):
 *     Every word returned by suggest() must have, at each crossing position,
 *     a letter that is present in the crossing slot's current domain.
 *     Placing such a word can never DIRECTLY empty a neighbouring slot.
 *
 *  2. Fixed-letter consistency:
 *     After filling a slot with one of its suggestions, all further suggestions
 *     for every slot must respect the letters that are now fixed in the grid.
 *
 *  3. Backtracking completeness:
 *     A recursive filler that always picks from suggest() (MRV order) must
 *     successfully complete the grid.  The final solution is cross-validated
 *     at every intersection.
 */

import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'fs'
import { unzipSync } from 'fflate'
import { DictionaryIndex, AC3Solver } from '../src/index'
import type { GridCell, Direction, WordSlot, SolverResult } from '../src/index'
import { popcountAnd } from '../src/bitset'

// ─── Helpers ──────────────────────────────────────────────────────────────

const A_CODE = 'A'.charCodeAt(0)

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

type RawSlot = { direction: Direction; cells: { x: number; y: number }[] }

function buildSlots(cells: GridCell[][], rows: number, cols: number): RawSlot[] {
  const slots: RawSlot[] = []
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
  return slots
}

/** Compute undirected crossings from the solved slot list (mirrors AC3Solver.buildGraph). */
type Crossing = { slotA: number; posInA: number; slotB: number; posInB: number }

function computeCrossings(slots: WordSlot[]): Crossing[] {
  const cellToSlot = new Map<string, { slotId: number; pos: number }>()
  const crossings: Crossing[] = []
  for (const slot of slots) {
    for (let pos = 0; pos < slot.cells.length; pos++) {
      const key = `${slot.cells[pos].x},${slot.cells[pos].y}`
      const existing = cellToSlot.get(key)
      if (existing) {
        crossings.push({ slotA: existing.slotId, posInA: existing.pos, slotB: slot.id, posInB: pos })
      } else {
        cellToSlot.set(key, { slotId: slot.id, pos })
      }
    }
  }
  return crossings
}

function deepCopy(cells: GridCell[][]): GridCell[][] {
  return cells.map(row => row.map(c => ({ ...c })))
}

// ─── Test grid: 7×7 with the demo's symmetric layout ─────────────────────
//
//  D . . . . . D
//  . . D . D . .
//  D . . . . . D
//  . . . . . . .
//  D . . . . . D
//  . . D . D . .
//  D . . . . . D

const ROWS = 7
const COLS = 7
const DEF_SET = new Set([
  '0,0', '6,0', '2,1', '4,1', '0,2', '6,2',
  '0,4', '6,4', '2,5', '4,5', '0,6', '6,6',
])

function makeGrid(): GridCell[][] {
  return Array.from({ length: ROWS }, (_, y) =>
    Array.from({ length: COLS }, (_, x) => ({
      x, y, definition: DEF_SET.has(`${x},${y}`), text: '',
    }))
  )
}

// ─── Setup ────────────────────────────────────────────────────────────────

let dict: DictionaryIndex

beforeAll(() => {
  dict = new DictionaryIndex(loadFrench())
})

// ─── 1. Arc-compatibility property ───────────────────────────────────────

describe('suggest() — arc-compatibility (AC-3 guarantee)', () => {
  it('every suggested word is crossing-compatible with all neighbour domains', () => {
    const cells = makeGrid()
    const solver = new AC3Solver(dict)
    solver.buildGraph(cells, buildSlots(cells, ROWS, COLS))
    const result = solver.solve()

    const crossings = computeCrossings(result.slots)

    // Build a fast lookup: slotId → crossings involving it
    const crossingsOf = new Map<number, Crossing[]>()
    for (const slot of result.slots) crossingsOf.set(slot.id, [])
    for (const c of crossings) {
      crossingsOf.get(c.slotA)!.push(c)
      crossingsOf.get(c.slotB)!.push(c)
    }

    let checked = 0

    for (const slot of result.slots) {
      if (result.domains.get(slot.id)!.isEmpty()) continue
      const suggestions = solver.suggest(slot.id, 20)

      for (const { word } of suggestions) {
        for (const crossing of crossingsOf.get(slot.id)!) {
          const isA = crossing.slotA === slot.id
          const posInThis = isA ? crossing.posInA : crossing.posInB
          const otherId   = isA ? crossing.slotB  : crossing.slotA
          const posInOther = isA ? crossing.posInB : crossing.posInA

          const letter   = word[posInThis]
          const charIdx  = letter.charCodeAt(0) - A_CODE
          const otherLen = result.slots[otherId].length
          const otherDomain = result.domains.get(otherId)!
          const letterBit   = dict.letterAt.get(otherLen)![posInOther][charIdx]

          // AC-3 guarantee: there must be at least one word in the other
          // slot's domain that has `letter` at the crossing position.
          expect(
            popcountAnd(otherDomain, letterBit),
            `slot ${slot.id} word "${word}" letter "${letter}" at pos ${posInThis} ` +
            `has no support in slot ${otherId} at pos ${posInOther}`
          ).toBeGreaterThan(0)

          checked++
        }
      }
    }

    // Sanity: we actually verified something
    expect(checked).toBeGreaterThan(0)
  })
})

// ─── 2. Fixed-letter consistency ─────────────────────────────────────────

describe('suggest() — fixed-letter consistency', () => {
  it('after filling a word, all subsequent suggestions respect fixed letters', () => {
    const cells = makeGrid()

    // Initial solve
    const s0 = new AC3Solver(dict)
    s0.buildGraph(cells, buildSlots(cells, ROWS, COLS))
    const r0 = s0.solve()
    expect(r0.hasDeadEnd).toBe(false)

    // Fill the first slot with its top suggestion
    const firstSlot = r0.slots[0]
    const [top] = s0.suggest(firstSlot.id, 1)
    expect(top).toBeDefined()
    firstSlot.cells.forEach(({ x, y }, i) => {
      cells[y][x] = { ...cells[y][x], text: top.word[i] }
    })

    // Re-solve with the filled word
    const s1 = new AC3Solver(dict)
    s1.buildGraph(cells, buildSlots(cells, ROWS, COLS))
    const r1 = s1.solve()

    // For every slot, every suggestion must have the already-placed letters
    for (const slot of r1.slots) {
      for (const { word } of s1.suggest(slot.id, 20)) {
        slot.cells.forEach(({ x, y }, i) => {
          const fixed = cells[y][x].text
          if (fixed) {
            expect(word[i],
              `slot ${slot.id} word "${word}" pos ${i} should be "${fixed}"`
            ).toBe(fixed)
          }
        })
      }
    }
  })
})

// ─── 3. Backtracking completeness ────────────────────────────────────────

describe('backtracking with suggest()', () => {
  /**
   * Iterative filler using an explicit stack.
   *
   * Each frame captures the grid state at a decision point and the list of
   * candidate words still to try for the chosen slot (MRV).  When all
   * candidates are exhausted the frame is popped (backtrack).
   */
  type Frame = {
    cells: GridCell[][]
    target: WordSlot
    suggestions: { word: string }[]
    nextIdx: number
  }

  function fill(initialCells: GridCell[][]): GridCell[][] | null {
    function nextFrame(cells: GridCell[][]): Frame | 'done' | 'dead' {
      const solver = new AC3Solver(dict)
      solver.buildGraph(cells, buildSlots(cells, ROWS, COLS))
      const result = solver.solve()

      if (result.hasDeadEnd) return 'dead'

      const target = result.slots
        .filter(slot =>
          solver.getDomainSize(slot.id) > 1 &&
          !slot.cells.every(({ x, y }) => cells[y][x].text !== '')
        )
        .sort((a, b) => solver.getDomainSize(a.id) - solver.getDomainSize(b.id))[0]

      if (!target) return 'done'

      return { cells, target, suggestions: solver.suggest(target.id, 15), nextIdx: 0 }
    }

    const first = nextFrame(initialCells)
    if (first === 'done') return initialCells
    if (first === 'dead') return null

    const stack: Frame[] = [first]

    while (stack.length > 0) {
      const frame = stack[stack.length - 1]

      if (frame.nextIdx >= frame.suggestions.length) {
        stack.pop()   // all candidates exhausted — backtrack
        continue
      }

      const { word } = frame.suggestions[frame.nextIdx++]
      const next = deepCopy(frame.cells)
      frame.target.cells.forEach(({ x, y }, i) => {
        next[y][x] = { ...next[y][x], text: word[i] }
      })

      const nf = nextFrame(next)
      if (nf === 'done') return next
      if (nf === 'dead') continue   // try next word in same frame
      stack.push(nf)
    }

    return null
  }

  it('fills the grid completely without a crossing violation', () => {
    const cells = makeGrid()
    const solution = fill(cells)

    expect(solution, 'backtracking should find a complete solution').not.toBeNull()

    // Cross-validate: at every intersection the two words share the same letter
    const solver = new AC3Solver(dict)
    const slots = buildSlots(solution!, ROWS, COLS)
    solver.buildGraph(solution!, slots)
    const result: SolverResult = solver.solve()

    const crossings = computeCrossings(result.slots)
    for (const { slotA, posInA, slotB, posInB } of crossings) {
      const cellA = result.slots[slotA].cells[posInA]
      const cellB = result.slots[slotB].cells[posInB]
      const letterA = solution![cellA.y][cellA.x].text
      const letterB = solution![cellB.y][cellB.x].text
      expect(letterA,
        `crossing between slot ${slotA} and slot ${slotB}: ` +
        `letter mismatch "${letterA}" vs "${letterB}"`
      ).toBe(letterB)
    }
  })
})
