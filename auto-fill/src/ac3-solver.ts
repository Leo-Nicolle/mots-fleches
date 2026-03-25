import { BitSet, hasOverlap, popcountAnd } from "./bitset";
import { DictionaryIndex } from "./dictionary-index";

const A_CODE = 65;

// ─── Types ──────────────────────────────────────────────────────────────

export interface GridCell {
  x: number;
  y: number;
  definition: boolean;
  text: string;
}

export type Direction = "horizontal" | "vertical";

export interface WordSlot {
  id: number;
  direction: Direction;
  cells: { x: number; y: number }[];
  length: number;
  /** Pattern: uppercase letters for filled, '*' for empty. e.g. "A**R*" */
  pattern: string;
}

/** An undirected crossing between two slots at specific character positions. */
interface Crossing {
  slotA: number;
  slotB: number;
  posInA: number;
  posInB: number;
}

/** Per-cell info returned by the solver */
export interface CellInfo {
  x: number;
  y: number;
  /** Is this cell empty (fillable)? */
  empty: boolean;
  /** Letter → number of valid words using that letter at this cell */
  possibilities: Record<string, number>;
  /** Total count across all letters */
  total: number;
  /** Is this cell part of any horizontal slot? */
  inHorizontal: boolean;
  /** Is this cell part of any vertical slot? */
  inVertical: boolean;
}

export interface SolverResult {
  /** Per-slot: the remaining valid words (as BitSet indices) */
  domains: Map<number, BitSet>;
  /** Per-cell info with letter possibilities */
  cells: CellInfo[][];
  /** Word slots extracted from the grid */
  slots: WordSlot[];
  /** Slot IDs with empty domain (unsolvable) */
  deadSlots: number[];
  /** True if any slot is dead */
  hasDeadEnd: boolean;
}

export interface ScoredWord {
  word: string;
  /** Log-product of cross-support counts. Higher = more freedom. */
  score: number;
}

// ─── Solver ─────────────────────────────────────────────────────────────

export class AC3Solver {
  private dict: DictionaryIndex;
  private slots: WordSlot[] = [];
  private crossings: Crossing[] = [];
  /** crossingsOf[slotId] = all crossings involving that slot */
  private crossingsOf: Map<number, Crossing[]> = new Map();
  /** Last solve result — domains kept for suggest() */
  private domains: Map<number, BitSet> = new Map();

  constructor(dict: DictionaryIndex) {
    this.dict = dict;
  }

  /**
   * Build the constraint graph from a grid.
   *
   * @param cells - cells[y][x] with {definition, text, x, y}
   * @param rawSlots - word slots from the grid, each with direction and cell coords.
   *   Typically from grid.getWords('horizontal').concat(grid.getWords('vertical'))
   *   mapped to { direction, cells: [{x,y}, ...] }.
   */
  buildGraph(
    cells: GridCell[][],
    rawSlots: { direction: Direction; cells: { x: number; y: number }[] }[]
  ): void {
    // Build WordSlot objects
    this.slots = rawSlots
      .filter((s) => s.cells.length > 1)
      .map((s, id) => ({
        id,
        direction: s.direction,
        cells: s.cells,
        length: s.cells.length,
        pattern: s.cells
          .map(({ x, y }) => {
            const text = cells[y]?.[x]?.text ?? "";
            return text.length > 0 ? text.toUpperCase() : "*";
          })
          .join(""),
      }));

    // Find crossings: cells shared by two slots
    const cellToSlotPos = new Map<string, { slotId: number; pos: number }>();
    this.crossings = [];
    this.crossingsOf = new Map();

    for (const slot of this.slots) {
      this.crossingsOf.set(slot.id, []);
    }

    for (const slot of this.slots) {
      for (let pos = 0; pos < slot.cells.length; pos++) {
        const { x, y } = slot.cells[pos];
        const key = `${x},${y}`;
        const existing = cellToSlotPos.get(key);
        if (existing) {
          // Found a crossing
          const crossing: Crossing = {
            slotA: existing.slotId,
            slotB: slot.id,
            posInA: existing.pos,
            posInB: pos,
          };
          this.crossings.push(crossing);
          this.crossingsOf.get(existing.slotId)!.push(crossing);
          this.crossingsOf.get(slot.id)!.push(crossing);
        } else {
          cellToSlotPos.set(key, { slotId: slot.id, pos });
        }
      }
    }
  }

  /**
   * Run AC-3 propagation. Returns per-slot domains and per-cell info.
   *
   * @param bailCheck - optional function called periodically; return true to abort early
   */
  solve(bailCheck?: () => boolean): SolverResult {
    const { slots, crossings, crossingsOf, dict } = this;

    // 1. Initialize domains from patterns
    const domains = new Map<number, BitSet>();
    for (const slot of slots) {
      const domain = dict.getMatchingWords(slot.length, slot.pattern);
      domains.set(slot.id, domain ?? new BitSet(0));
    }

    // 2. Build AC-3 queue with all directed arcs
    //    Each undirected crossing generates two directed arcs:
    //    "revise A based on B" and "revise B based on A"
    interface Arc {
      target: number;
      source: number;
      posTarget: number;
      posSource: number;
    }

    const queue: Arc[] = [];
    const inQueue = new Set<string>();

    const enqueue = (arc: Arc): void => {
      const key = `${arc.target}->${arc.source}`;
      if (!inQueue.has(key)) {
        inQueue.add(key);
        queue.push(arc);
      }
    };

    for (const c of crossings) {
      enqueue({
        target: c.slotA,
        source: c.slotB,
        posTarget: c.posInA,
        posSource: c.posInB,
      });
      enqueue({
        target: c.slotB,
        source: c.slotA,
        posTarget: c.posInB,
        posSource: c.posInA,
      });
    }

    // 3. AC-3 main loop
    while (queue.length > 0) {
      if (bailCheck?.()) break;

      const arc = queue.pop()!;
      inQueue.delete(`${arc.target}->${arc.source}`);

      const changed = this.revise(domains, arc);
      if (!changed) continue;

      const domTarget = domains.get(arc.target)!;
      if (domTarget.isEmpty()) {
        // Dead end — this slot can't be filled.
        // Continue to let other arcs detect cascading dead ends.
        // (Or break early if you want speed over completeness.)
      }

      // Re-enqueue arcs: for each crossing involving arc.target,
      // the OTHER slot may need re-checking since target's domain shrank.
      for (const crossing of crossingsOf.get(arc.target)!) {
        const otherSlot =
          crossing.slotA === arc.target ? crossing.slotB : crossing.slotA;
        if (otherSlot === arc.source) continue; // skip the arc that triggered this

        const posOther =
          crossing.slotA === arc.target ? crossing.posInB : crossing.posInA;
        const posTarget =
          crossing.slotA === arc.target ? crossing.posInA : crossing.posInB;

        enqueue({
          target: otherSlot,
          source: arc.target,
          posTarget: posOther,
          posSource: posTarget,
        });
      }
    }

    this.domains = domains;

    // 4. Build per-cell info
    const deadSlots: number[] = [];
    for (const slot of slots) {
      if (domains.get(slot.id)!.isEmpty()) {
        deadSlots.push(slot.id);
      }
    }

    const cells = this.buildCellInfo(domains);

    return {
      domains,
      cells,
      slots,
      deadSlots,
      hasDeadEnd: deadSlots.length > 0,
    };
  }

  /**
   * Revise arc: prune target's domain to only words whose letter at posTarget
   * is supported by at least one word in source's domain at posSource.
   * Returns true if target's domain was reduced.
   */
  private revise(
    domains: Map<number, BitSet>,
    arc: { target: number; source: number; posTarget: number; posSource: number }
  ): boolean {
    const domTarget = domains.get(arc.target)!;
    const domSource = domains.get(arc.source)!;

    if (domTarget.isEmpty()) return false;

    const lenTarget = this.slots[arc.target].length;
    const lenSource = this.slots[arc.source].length;
    const laTarget = this.dict.letterAt.get(lenTarget);
    const laSource = this.dict.letterAt.get(lenSource);
    if (!laTarget || !laSource) return false;

    // Build a mask of all supported words in target:
    // A word in target is supported if its letter at posTarget
    // is also possible in source at posSource.
    const numBits = this.dict.counts.get(lenTarget) ?? 0;
    const supported = new BitSet(numBits);

    for (let c = 0; c < 26; c++) {
      // Does source have any word with letter c at posSource?
      const sourceIndex = laSource[arc.posSource][c];
      if (!hasOverlap(domSource, sourceIndex)) continue;

      // Yes — all words in target with letter c at posTarget are supported
      supported.orWith(laTarget[arc.posTarget][c]);
    }

    return domTarget.andWith(supported);
  }

  /**
   * Build per-cell letter possibility info from solved domains.
   */
  private buildCellInfo(
    domains: Map<number, BitSet>
  ): CellInfo[][] {
    // First pass: find grid bounds
    let maxX = 0;
    let maxY = 0;
    for (const slot of this.slots) {
      for (const { x, y } of slot.cells) {
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }

    // Init cell grid
    const cells: CellInfo[][] = [];
    for (let y = 0; y <= maxY; y++) {
      const row: CellInfo[] = [];
      for (let x = 0; x <= maxX; x++) {
        row.push({
          x,
          y,
          empty: false,
          possibilities: {},
          total: 0,
          inHorizontal: false,
          inVertical: false,
        });
      }
      cells.push(row);
    }

    // Fill from slots
    for (const slot of this.slots) {
      const domain = domains.get(slot.id)!;
      const la = this.dict.letterAt.get(slot.length);
      if (!la) continue;

      for (let pos = 0; pos < slot.cells.length; pos++) {
        const { x, y } = slot.cells[pos];
        const cell = cells[y][x];
        cell.empty = true;

        if (slot.direction === "horizontal") cell.inHorizontal = true;
        else cell.inVertical = true;

        // Count words per letter at this position
        for (let c = 0; c < 26; c++) {
          const count = popcountAnd(domain, la[pos][c]);
          if (count > 0) {
            const letter = String.fromCharCode(A_CODE + c);
            // At intersections, take the min of H and V counts
            if (cell.possibilities[letter] !== undefined) {
              cell.possibilities[letter] = Math.min(
                cell.possibilities[letter],
                count
              );
            } else {
              cell.possibilities[letter] = count;
            }
          }
        }
      }
    }

    // Compute totals
    for (const row of cells) {
      for (const cell of row) {
        cell.total = Object.values(cell.possibilities).reduce(
          (sum, v) => sum + v,
          0
        );
      }
    }

    return cells;
  }

  /**
   * Rank words for a given slot by "freedom score":
   * how many options they leave open at crossing slots.
   *
   * Must be called after solve().
   *
   * @param slotId - which slot to get suggestions for
   * @param maxResults - cap on returned words (default 100)
   */
  suggest(slotId: number, maxResults = 100): ScoredWord[] {
    const domain = this.domains.get(slotId);
    if (!domain || domain.isEmpty()) return [];

    const slot = this.slots[slotId];
    const crossings = this.crossingsOf.get(slotId) ?? [];

    // Precompute per-crossing, per-letter support counts in crossing slots
    const crossingData: {
      posInSlot: number;
      support: Float64Array; // support[charIdx] = popcount of supported words
    }[] = [];

    for (const crossing of crossings) {
      const isA = crossing.slotA === slotId;
      const otherSlotId = isA ? crossing.slotB : crossing.slotA;
      const posInSlot = isA ? crossing.posInA : crossing.posInB;
      const posInOther = isA ? crossing.posInB : crossing.posInA;

      const otherDomain = this.domains.get(otherSlotId)!;
      const otherLen = this.slots[otherSlotId].length;
      const la = this.dict.letterAt.get(otherLen);
      if (!la) continue;

      const support = new Float64Array(26);
      for (let c = 0; c < 26; c++) {
        support[c] = popcountAnd(otherDomain, la[posInOther][c]);
      }

      crossingData.push({ posInSlot, support });
    }

    // Score each candidate word
    const words = this.dict.wordsByLength.get(slot.length)!;
    const scored: ScoredWord[] = [];

    domain.forEachBit((wordIdx) => {
      if (wordIdx >= words.length) return;
      const word = words[wordIdx];
      let score = 0;
      let dead = false;

      for (const { posInSlot, support } of crossingData) {
        const charIdx = word.charCodeAt(posInSlot) - A_CODE;
        const s = support[charIdx];
        if (s === 0) {
          dead = true;
          break;
        }
        score += Math.log(s);
      }

      if (!dead) {
        scored.push({ word, score });
      }
    });

    // Sort descending by score, take top N
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, maxResults);
  }

  /**
   * Get words remaining in a slot's domain (unranked).
   * Must be called after solve().
   */
  getWords(slotId: number): string[] {
    const domain = this.domains.get(slotId);
    if (!domain) return [];
    const slot = this.slots[slotId];
    return this.dict.getWords(slot.length, domain);
  }

  /**
   * Get domain size for a slot.
   */
  getDomainSize(slotId: number): number {
    return this.domains.get(slotId)?.popcount() ?? 0;
  }
}
