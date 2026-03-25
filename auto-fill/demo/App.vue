<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import * as fflate from 'fflate'
import { DictionaryIndex, AC3Solver } from '../src/index'
import type { GridCell, SolverResult, ScoredWord } from '../src/index'

// ─── Grid layout ─────────────────────────────────────────────────────────

const ROWS = 12
const COLS = 10

// ─── Maze generator (ported from client/src/js/maze-generator.ts) ────────
// Generates definition cell positions to match the dictionary's word-length
// distribution, using a weighted random placement strategy.

type Cells = { definition: boolean }[][]

function getLen(cells: Cells, x: number, y: number, dx: number, dy: number): number {
  let len = -1, cx = x, cy = y
  while (cells[cy]?.[cx] && !cells[cy][cx].definition) { len++; cx += dx; cy += dy }
  return len
}

function getActualDistrib(cells: Cells, rows: number, cols: number, minWord: number, maxWord: number) {
  const dist: Record<string, number> = {}
  let total = 0
  const tally = (run: number) => {
    if (run < minWord || run > maxWord) return
    dist[run] = (dist[run] || 0) + 1
    total++
  }
  for (let y = 0; y < rows; y++) {
    let run = 0
    for (let x = 0; x <= cols; x++) {
      if (x === cols || cells[y][x].definition) { tally(run); run = 0 } else run++
    }
  }
  for (let x = 0; x < cols; x++) {
    let run = 0
    for (let y = 0; y <= rows; y++) {
      if (y === rows || cells[y][x].definition) { tally(run); run = 0 } else run++
    }
  }
  if (!total) return dist
  return Object.fromEntries(Object.entries(dist).map(([k, v]) => [k, v / total]))
}

function placeOneDefinition(
  cells: GridCell[][], rows: number, cols: number,
  scaledDistib: Record<string, number>, minWord: number, maxWord: number
) {
  const candidates = []
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (cells[y][x].definition) continue
      const lL = getLen(cells, x, y, -1, 0)
      const lR = getLen(cells, x, y, 1, 0)
      const lT = getLen(cells, x, y, 0, -1)
      const lB = getLen(cells, x, y, 0, 1)
      candidates.push({ x, y, lL, lR, lT, lB })
    }
  }

  const actDistrib = getActualDistrib(cells, rows, cols, minWord, maxWord)

  const weights = candidates.map(e => {
    const weightIfCut = [e.lL, e.lR, e.lT, e.lB]
      .map(l => (scaledDistib[l] || 0) - (actDistrib[l] || 0))
      .reduce((acc, diff) => acc + (diff + 1) / 2, 0) / 4

    const weightIfNotCut = [e.lL + e.lR + 1, e.lT + e.lB + 1]
      .map(l => (actDistrib[l] || 0) - (scaledDistib[l] || 0))
      .reduce((acc, diff) => acc + (diff + 1) / 2, 0) / 2

    const impossible =
      e.lL < minWord || e.lT < minWord ||
      (e.x < cols - 1 && e.lR < minWord) ||
      (e.y < rows - 1 && e.lB < minWord) ||
      (e.x === cols - 1 && e.y === rows - 1)

    return { x: e.x, y: e.y, w: (weightIfCut + weightIfNotCut) * (impossible ? 0 : 1) }
  })

  const totalW = weights.reduce((s, p) => s + p.w, 0)
  if (totalW === 0) return

  let pick = Math.random() * totalW
  for (const { x, y, w } of weights) {
    pick -= w
    if (pick <= 0) { cells[y][x] = { ...cells[y][x], definition: true }; return }
  }
}

function generateMaze(cells: GridCell[][], rows: number, cols: number, distribution: [number, number][]) {
  const minWord = 2
  const maxWord = Math.max(...distribution.map(([l]) => l))

  // Seed: top row and left column at every other cell (same as original)
  for (let x = 0; x < cols; x += 2) cells[0][x] = { ...cells[0][x], definition: true }
  for (let y = 0; y < rows; y += 2) cells[y][0] = { ...cells[y][0], definition: true }

  const sliceTotal = distribution
    .slice(minWord, Math.max(rows, cols) + 1)
    .reduce((acc, [, e]) => acc + e, 0)

  const scaledDistib = distribution
    .slice(minWord, Math.max(rows, cols) + 1)
    .reduce((acc, [key, value]) => { acc[key] = value / sliceTotal; return acc }, {} as Record<string, number>)

  for (let i = 0; i < rows; i++) {
    placeOneDefinition(cells, rows, cols, scaledDistib, minWord, maxWord)
  }
}

// ─── Word generator (demo dictionary) ────────────────────────────────────

function normalizeWord(w: string): string {
  return w.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[ '-]/g, '').toUpperCase()
}

async function fetchDictionary(locale: string): Promise<string[]> {
  const response = await fetch(`/${locale}.zip`)
  const buffer = new Uint8Array(await response.arrayBuffer())
  return new Promise((resolve, reject) => {
    fflate.unzip(buffer, (err, files) => {
      if (err) return reject(err)
      const raw = new TextDecoder().decode(files['dico.txt']).trim().split(',')
      resolve(raw.map(normalizeWord).filter(w => w.length >= 2))
    })
  })
}

// ─── Grid state ───────────────────────────────────────────────────────────

const gridCells = ref<GridCell[][]>([])

function initGrid() {
  const cells: GridCell[][] = []
  for (let y = 0; y < ROWS; y++) {
    const row: GridCell[] = []
    for (let x = 0; x < COLS; x++) {
      row.push({ x, y, definition: false, text: '' })
    }
    cells.push(row)
  }
  gridCells.value = cells
}

function buildRawSlots() {
  const cells = gridCells.value
  const raw: { direction: 'horizontal' | 'vertical'; cells: { x: number; y: number }[] }[] = []

  for (let y = 0; y < ROWS; y++) {
    let run: { x: number; y: number }[] = []
    for (let x = 0; x <= COLS; x++) {
      if (x === COLS || cells[y][x].definition) {
        if (run.length > 1) raw.push({ direction: 'horizontal', cells: [...run] })
        run = []
      } else {
        run.push({ x, y })
      }
    }
  }

  for (let x = 0; x < COLS; x++) {
    let run: { x: number; y: number }[] = []
    for (let y = 0; y <= ROWS; y++) {
      if (y === ROWS || cells[y][x].definition) {
        if (run.length > 1) raw.push({ direction: 'vertical', cells: [...run] })
        run = []
      } else {
        run.push({ x, y })
      }
    }
  }

  return raw
}

// ─── Solver state ─────────────────────────────────────────────────────────

let dictIndex: DictionaryIndex | null = null
let lastSolver: AC3Solver | null = null

const solverResult = ref<SolverResult | null>(null)
const selectedSlotId = ref<number | null>(null)
const suggestions = ref<ScoredWord[]>([])
const isReady = ref(false)
const isLoadingDict = ref(false)
const locale = ref<'fr-fr' | 'en-en' | 'es-es'>('fr-fr')

async function loadLocale(loc: typeof locale.value) {
  isReady.value = false
  isLoadingDict.value = true
  selectedSlotId.value = null
  suggestions.value = []
  const words = await fetchDictionary(loc)
  dictIndex = new DictionaryIndex(words)
  isLoadingDict.value = false
  isReady.value = true
  generateLayout()
}

function generateLayout() {
  if (!dictIndex) return
  initGrid()
  const distribution = [...dictIndex.counts.entries()]
    .map(([len, count]) => [len, count] as [number, number])
    .sort((a, b) => a[0] - b[0])
  generateMaze(gridCells.value, ROWS, COLS, distribution)
  gridCells.value = gridCells.value.map(row => [...row])
  selectedSlotId.value = null
  suggestions.value = []
  solve()
}

async function changeLocale(loc: typeof locale.value) {
  locale.value = loc
  await loadLocale(loc)
}

function solve() {
  if (!dictIndex) return
  const solver = new AC3Solver(dictIndex)
  solver.buildGraph(gridCells.value, buildRawSlots())
  solverResult.value = solver.solve()
  lastSolver = solver
  // Refresh suggestions for selected slot
  if (selectedSlotId.value !== null) {
    suggestions.value = solver.suggest(selectedSlotId.value, 40)
  }
}

// ─── Cell interaction ─────────────────────────────────────────────────────

const cellToSlots = computed(() => {
  const map = new Map<string, number[]>()
  for (const slot of solverResult.value?.slots ?? []) {
    for (const { x, y } of slot.cells) {
      const key = `${x},${y}`
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(slot.id)
    }
  }
  return map
})

const selectedCells = computed(() => {
  if (selectedSlotId.value === null || !solverResult.value) return new Set<string>()
  const slot = solverResult.value.slots[selectedSlotId.value]
  return new Set(slot?.cells.map(c => `${c.x},${c.y}`) ?? [])
})

const selectedSlot = computed(() =>
  selectedSlotId.value !== null ? solverResult.value?.slots[selectedSlotId.value] : null
)

function clickCell(x: number, y: number) {
  if (gridCells.value[y][x].definition) return
  const slots = cellToSlots.value.get(`${x},${y}`) ?? []
  if (!slots.length) return

  if (selectedSlotId.value !== null && slots.includes(selectedSlotId.value)) {
    // Cycle to next slot at this cell
    const idx = slots.indexOf(selectedSlotId.value)
    selectedSlotId.value = slots[(idx + 1) % slots.length]
  } else {
    selectedSlotId.value = slots[0]
  }

  suggestions.value = lastSolver?.suggest(selectedSlotId.value!, 40) ?? []
}

function fillWord(word: string) {
  if (selectedSlotId.value === null || !solverResult.value) return
  const slot = solverResult.value.slots[selectedSlotId.value]
  if (!slot) return
  const cells = gridCells.value
  slot.cells.forEach(({ x, y }, i) => {
    cells[y][x] = { ...cells[y][x], text: word[i] ?? '' }
  })
  gridCells.value = cells.map(row => [...row])
  solve()
}

function resetGrid() {
  generateLayout()
}

// ─── Cell display helpers ─────────────────────────────────────────────────

function topLetter(x: number, y: number): string {
  const gc = gridCells.value[y]?.[x]
  if (!gc || gc.definition) return ''
  if (gc.text) return gc.text
  const info = solverResult.value?.cells[y]?.[x]
  if (!info?.empty) return ''
  const entries = Object.entries(info.possibilities)
  if (!entries.length) return '?'
  return entries.reduce((a, b) => (b[1] > a[1] ? b : a))[0]
}

function cellTotal(x: number, y: number): number {
  return solverResult.value?.cells[y]?.[x]?.total ?? 0
}

function cellBg(x: number, y: number): string {
  const gc = gridCells.value[y]?.[x]
  if (!gc) return '#fff'
  if (gc.definition) return '#1e1e2e'

  const key = `${x},${y}`
  if (selectedCells.value.has(key)) return '#4f86f7'

  const info = solverResult.value?.cells[y]?.[x]
  if (!info?.empty) return '#f5f5f5'

  if (info.total === 0) return '#ff4d4d'
  if (gc.text) return '#a8e6a3'

  // Gradient: few options → warm (orange), many → cool (light blue-white)
  const ratio = Math.min(info.total / 80, 1)
  const r = Math.round(255 - ratio * 70)
  const g = Math.round(180 + ratio * 65)
  const b = Math.round(100 + ratio * 155)
  return `rgb(${r},${g},${b})`
}

function cellColor(x: number, y: number): string {
  const gc = gridCells.value[y]?.[x]
  if (!gc || gc.definition) return '#fff'
  const key = `${x},${y}`
  if (selectedCells.value.has(key)) return '#fff'
  const info = solverResult.value?.cells[y]?.[x]
  if (info?.total === 0) return '#fff'
  return '#222'
}

// ─── Init ─────────────────────────────────────────────────────────────────

onMounted(() => {
  initGrid()
  loadLocale(locale.value)
})
</script>

<template>
  <div class="app">
    <header class="header">
      <h1>Auto-Fill Demo</h1>
      <p>Solveur AC-3 par propagation de contraintes</p>
    </header>

    <div class="locale-bar">
      <button
        v-for="loc in (['fr-fr', 'en-en', 'es-es'] as const)"
        :key="loc"
        class="btn"
        :class="{ 'btn--active': locale === loc }"
        :disabled="isLoadingDict"
        @click="changeLocale(loc)"
      >{{ loc }}</button>
      <span v-if="isLoadingDict" class="loading-inline">Chargement…</span>
    </div>

    <div v-if="!isReady" class="loading">Initialisation du dictionnaire…</div>

    <div v-else class="layout">
      <!-- Grid -->
      <div class="grid-section">
        <div class="crossword-grid" :style="{ gridTemplateColumns: `repeat(${COLS}, 60px)`, gridTemplateRows: `repeat(${ROWS}, 60px)` }">
          <template v-for="y in ROWS" :key="y">
            <div
              v-for="x in COLS"
              :key="x"
              class="cell"
              :class="{
                'cell--def': gridCells[y - 1]?.[x - 1]?.definition,
                'cell--dead': !gridCells[y - 1]?.[x - 1]?.definition && cellTotal(x - 1, y - 1) === 0 && isReady,
                'cell--selected': selectedCells.has(`${x - 1},${y - 1}`),
                'cell--filled': !!gridCells[y - 1]?.[x - 1]?.text,
              }"
              :style="{ background: cellBg(x - 1, y - 1), color: cellColor(x - 1, y - 1) }"
              @click="clickCell(x - 1, y - 1)"
            >
              <span class="cell-letter">{{ topLetter(x - 1, y - 1) }}</span>
              <span v-if="!gridCells[y - 1]?.[x - 1]?.definition && cellTotal(x - 1, y - 1) > 0" class="cell-count">
                {{ cellTotal(x - 1, y - 1) }}
              </span>
            </div>
          </template>
        </div>

        <div class="grid-footer">
          <button class="btn" @click="resetGrid">Nouvelle grille</button>
          <div v-if="solverResult" class="status" :class="{ 'status--error': solverResult.hasDeadEnd }">
            <template v-if="solverResult.hasDeadEnd">
              ✗ {{ solverResult.deadSlots.length }} slot(s) sans solution
            </template>
            <template v-else>
              ✓ Grille satisfaisable — {{ solverResult.slots.length }} mots
            </template>
          </div>
        </div>

        <div class="legend">
          <div class="legend-item"><span class="swatch" style="background:#ff4d4d"></span> Aucune solution</div>
          <div class="legend-item"><span class="swatch" style="background:rgb(255,180,100)"></span> Peu d'options</div>
          <div class="legend-item"><span class="swatch" style="background:rgb(185,245,255)"></span> Beaucoup d'options</div>
          <div class="legend-item"><span class="swatch" style="background:#a8e6a3"></span> Remplie</div>
          <div class="legend-item"><span class="swatch" style="background:#4f86f7"></span> Sélectionnée</div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="sidebar">
        <div v-if="selectedSlot" class="slot-info">
          <h2>
            Slot {{ selectedSlotId }}
            <span class="direction-badge">{{ selectedSlot.direction === 'horizontal' ? '→' : '↓' }}</span>
          </h2>
          <p class="slot-meta">
            {{ selectedSlot.length }} lettres •
            <strong>{{ solverResult?.domains.get(selectedSlotId!)?.popcount() ?? 0 }}</strong> mots compatibles
          </p>
          <p class="slot-pattern">Motif: <code>{{ selectedSlot.pattern }}</code></p>

          <div v-if="suggestions.length" class="suggestions">
            <p class="suggestions-label">Meilleures suggestions (score de liberté) :</p>
            <div
              v-for="s in suggestions"
              :key="s.word"
              class="suggestion"
              @click="fillWord(s.word)"
            >
              <span class="word">{{ s.word }}</span>
              <span class="score">{{ s.score.toFixed(1) }}</span>
            </div>
          </div>
          <p v-else class="no-suggestions">Aucun mot compatible.</p>
        </div>
        <div v-else class="hint">
          <p>Cliquez sur une case pour voir les suggestions de mots.</p>
          <p>Cliquez à nouveau pour alterner entre les slots H/V.</p>
          <p>Cliquez sur un mot pour le placer dans la grille.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Segoe UI', system-ui, sans-serif;
  background: #f0f2f5;
  color: #222;
  min-height: 100vh;
}

.app {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px 16px;
}

.header {
  margin-bottom: 16px;
}

.locale-bar {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 20px;
}

.btn--active {
  background: #1e1e2e;
}

.loading-inline {
  font-size: 0.85rem;
  color: #888;
}

.header h1 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1e1e2e;
}

.header p {
  color: #666;
  margin-top: 4px;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

.layout {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

/* Grid */
.grid-section {
  flex-shrink: 0;
}

.crossword-grid {
  display: grid;
  gap: 2px;
  background: #8888aa;
  border: 2px solid #8888aa;
  border-radius: 4px;
  overflow: hidden;
}

.cell {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
  user-select: none;
}

.cell--def {
  cursor: default;
}

.cell:not(.cell--def):hover {
  filter: brightness(0.92);
}

.cell-letter {
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1;
}

.cell-count {
  position: absolute;
  bottom: 2px;
  right: 4px;
  font-size: 0.55rem;
  opacity: 0.7;
  font-weight: 500;
}

.grid-footer {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 12px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: #4f86f7;
  color: #fff;
  font-size: 0.9rem;
  cursor: pointer;
  font-weight: 500;
}

.btn:hover {
  background: #3a72e0;
}

.status {
  font-size: 0.85rem;
  color: #2e7d32;
  font-weight: 500;
}

.status--error {
  color: #c62828;
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: #555;
}

.swatch {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  border: 1px solid #ccc;
  display: inline-block;
}

/* Sidebar */
.sidebar {
  flex: 1;
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  min-height: 300px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}

.slot-info h2 {
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.direction-badge {
  font-size: 1rem;
  background: #e8eaf6;
  border-radius: 4px;
  padding: 0 6px;
}

.slot-meta {
  font-size: 0.9rem;
  color: #555;
  margin-bottom: 6px;
}

.slot-pattern {
  font-size: 0.85rem;
  color: #777;
  margin-bottom: 12px;
}

.slot-pattern code {
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
  letter-spacing: 0.1em;
}

.suggestions-label {
  font-size: 0.8rem;
  color: #888;
  margin-bottom: 8px;
}

.suggestions {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 480px;
  overflow-y: auto;
}

.suggestion {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  background: #f9f9f9;
  transition: background 0.15s;
}

.suggestion:hover {
  background: #e8f0fe;
}

.word {
  font-family: monospace;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.15em;
}

.score {
  font-size: 0.75rem;
  color: #999;
}

.no-suggestions {
  color: #c62828;
  font-size: 0.9rem;
}

.hint {
  color: #888;
  font-size: 0.9rem;
  line-height: 1.7;
}
</style>
