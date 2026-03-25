/**
 * Benchmark: measures real-world performance of the AC-3 solver
 * with a realistic dictionary size and grid layout.
 *
 * Run: npx ts-node benchmark.ts
 *   or: npx tsx benchmark.ts
 */

import { BitSet, hasOverlap, popcountAnd } from "./bitset";
import { DictionaryIndex } from "./dictionary-index";
import { AC3Solver, Direction, GridCell } from "./ac3-solver";

// ─── Generate a realistic dictionary ────────────────────────────────────

function generateDictionary(targetSize: number): string[] {
  const words: string[] = [];
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  // Realistic length distribution (French dictionary-ish)
  const lengthWeights: [number, number][] = [
    [2, 0.02],
    [3, 0.05],
    [4, 0.08],
    [5, 0.12],
    [6, 0.15],
    [7, 0.16],
    [8, 0.14],
    [9, 0.11],
    [10, 0.08],
    [11, 0.05],
    [12, 0.03],
    [13, 0.01],
  ];

  const seen = new Set<string>();

  for (const [len, weight] of lengthWeights) {
    const count = Math.floor(targetSize * weight);
    for (let i = 0; i < count; i++) {
      let word: string;
      do {
        word = "";
        for (let j = 0; j < len; j++) {
          // Weighted letter distribution (roughly French)
          const r = Math.random();
          if (r < 0.15) word += "E";
          else if (r < 0.25) word += "A";
          else if (r < 0.33) word += "I";
          else if (r < 0.40) word += "S";
          else if (r < 0.46) word += "N";
          else if (r < 0.52) word += "R";
          else if (r < 0.57) word += "T";
          else if (r < 0.61) word += "O";
          else if (r < 0.65) word += "L";
          else if (r < 0.69) word += "U";
          else word += chars[Math.floor(Math.random() * 26)];
        }
      } while (seen.has(word));
      seen.add(word);
      words.push(word);
    }
  }

  return words;
}

// ─── Generate a realistic grid ──────────────────────────────────────────

/**
 * Creates a 13x13 grid with a typical "mots-fleches" layout:
 * definition cells scattered, creating word slots of various lengths.
 */
function generateGrid(
  rows: number,
  cols: number,
  definitionRatio: number = 0.15,
  prefillRatio: number = 0.05
): {
  cells: GridCell[][];
  slots: { direction: Direction; cells: { x: number; y: number }[] }[];
} {
  const cells: GridCell[][] = [];

  // Place definition cells
  for (let y = 0; y < rows; y++) {
    const row: GridCell[] = [];
    for (let x = 0; x < cols; x++) {
      const isDef =
        (x === 0 && y === 0) || // top-left often definition
        Math.random() < definitionRatio;
      row.push({
        x,
        y,
        definition: isDef,
        text: "",
      });
    }
    cells.push(row);
  }

  // Prefill some cells to simulate partial solve
  let prefilled = 0;
  const maxPrefill = Math.floor(rows * cols * prefillRatio);
  while (prefilled < maxPrefill) {
    const x = Math.floor(Math.random() * cols);
    const y = Math.floor(Math.random() * rows);
    if (!cells[y][x].definition && !cells[y][x].text) {
      cells[y][x].text = String.fromCharCode(
        65 + Math.floor(Math.random() * 26)
      );
      prefilled++;
    }
  }

  // Extract word slots
  const slots: { direction: Direction; cells: { x: number; y: number }[] }[] =
    [];

  // Horizontal
  for (let y = 0; y < rows; y++) {
    let current: { x: number; y: number }[] = [];
    for (let x = 0; x < cols; x++) {
      if (cells[y][x].definition) {
        if (current.length > 1) slots.push({ direction: "horizontal", cells: current });
        current = [];
      } else {
        current.push({ x, y });
      }
    }
    if (current.length > 1) slots.push({ direction: "horizontal", cells: current });
  }

  // Vertical
  for (let x = 0; x < cols; x++) {
    let current: { x: number; y: number }[] = [];
    for (let y = 0; y < rows; y++) {
      if (cells[y][x].definition) {
        if (current.length > 1) slots.push({ direction: "vertical", cells: current });
        current = [];
      } else {
        current.push({ x, y });
      }
    }
    if (current.length > 1) slots.push({ direction: "vertical", cells: current });
  }

  return { cells, slots };
}

// ─── Benchmark ──────────────────────────────────────────────────────────

function bench(label: string, fn: () => void, iterations: number = 1): number {
  // Warmup
  fn();

  const times: number[] = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    fn();
    times.push(performance.now() - start);
  }

  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);
  console.log(
    `  ${label}: avg=${avg.toFixed(1)}ms  min=${min.toFixed(1)}ms  max=${max.toFixed(1)}ms`
  );
  return avg;
}

function main() {
  console.log("=== AC-3 Crossword Solver Benchmark ===\n");

  // 1. Dictionary generation
  console.log("Generating dictionary...");
  const words = generateDictionary(440_000);
  console.log(`  ${words.length.toLocaleString()} words generated\n`);

  // 2. Dictionary indexing
  console.log("Dictionary indexing:");
  let dict!: DictionaryIndex;
  bench(
    "Build index",
    () => {
      dict = new DictionaryIndex(words);
    },
    3
  );

  // Report index stats
  let totalBitsets = 0;
  let totalMemory = 0;
  for (const len of dict.lengths) {
    const count = dict.counts.get(len)!;
    const numBitsets = len * 26;
    const bytesPerBitset = Math.ceil(count / 32) * 4;
    totalBitsets += numBitsets;
    totalMemory += numBitsets * bytesPerBitset;
  }
  console.log(`  ${totalBitsets} bitsets, ~${(totalMemory / 1e6).toFixed(1)}MB total\n`);

  // 3. Grid generation
  const gridSizes = [
    { rows: 8, cols: 8, label: "8×8" },
    { rows: 13, cols: 13, label: "13×13" },
    { rows: 20, cols: 20, label: "20×20" },
  ];

  for (const { rows, cols, label } of gridSizes) {
    console.log(`Grid ${label}:`);
    const { cells, slots } = generateGrid(rows, cols);
    console.log(
      `  ${slots.length} word slots, ` +
        `avg length ${(slots.reduce((s, sl) => s + sl.cells.length, 0) / slots.length).toFixed(1)}`
    );

    // Count crossings
    const cellToSlots = new Map<string, number>();
    let crossingCount = 0;
    for (const slot of slots) {
      for (const { x, y } of slot.cells) {
        const key = `${x},${y}`;
        if (cellToSlots.has(key)) crossingCount++;
        cellToSlots.set(key, (cellToSlots.get(key) ?? 0) + 1);
      }
    }
    console.log(`  ${crossingCount} crossings`);

    // Build + solve
    let solver!: AC3Solver;
    let result!: ReturnType<AC3Solver["solve"]>;

    bench(
      "Build graph",
      () => {
        solver = new AC3Solver(dict);
        solver.buildGraph(cells, slots);
      },
      5
    );

    bench(
      "AC-3 solve",
      () => {
        solver = new AC3Solver(dict);
        solver.buildGraph(cells, slots);
        result = solver.solve();
      },
      5
    );

    // Stats
    let totalDomain = 0;
    let minDomain = Infinity;
    let maxDomain = 0;
    for (let i = 0; i < slots.length; i++) {
      const size = solver.getDomainSize(i);
      totalDomain += size;
      if (size < minDomain) minDomain = size;
      if (size > maxDomain) maxDomain = size;
    }
    console.log(
      `  Domains: min=${minDomain} max=${maxDomain} avg=${(totalDomain / slots.length).toFixed(0)}`
    );
    console.log(`  Dead slots: ${result.deadSlots.length}`);

    // Suggest benchmark (on first non-dead slot)
    const aliveSlot = slots.find((_, i) => solver.getDomainSize(i) > 0);
    if (aliveSlot) {
      bench(
        "Suggest (top 100)",
        () => {
          solver.suggest(aliveSlot.id, 100);
        },
        10
      );
      const suggestions = solver.suggest(aliveSlot.id, 5);
      console.log(
        `  Top suggestions: ${suggestions.map((s) => s.word).join(", ")}`
      );
    }

    console.log();
  }

  // 4. BitSet micro-benchmarks
  console.log("BitSet micro-benchmarks (60k bits):");
  const size = 60000;
  const a = new BitSet(size);
  const b = new BitSet(size);
  for (let i = 0; i < size; i++) {
    if (Math.random() < 0.5) a.set(i);
    if (Math.random() < 0.5) b.set(i);
  }

  const ITERS = 100_000;
  let start = performance.now();
  for (let i = 0; i < ITERS; i++) hasOverlap(a, b);
  console.log(
    `  hasOverlap: ${((performance.now() - start) / ITERS * 1000).toFixed(1)}µs`
  );

  start = performance.now();
  for (let i = 0; i < ITERS; i++) popcountAnd(a, b);
  console.log(
    `  popcountAnd: ${((performance.now() - start) / ITERS * 1000).toFixed(1)}µs`
  );

  start = performance.now();
  const c = a.clone();
  for (let i = 0; i < ITERS; i++) {
    c.data.set(a.data);
    c.andWith(b);
  }
  console.log(
    `  clone+AND: ${((performance.now() - start) / ITERS * 1000).toFixed(1)}µs`
  );

  start = performance.now();
  for (let i = 0; i < ITERS; i++) a.popcount();
  console.log(
    `  popcount: ${((performance.now() - start) / ITERS * 1000).toFixed(1)}µs`
  );
}

main();
