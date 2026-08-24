<template>
  <svg
    :viewBox="`0 0 ${width} ${height}`"
    :width="width"
    :height="height"
    xmlns="http://www.w3.org/2000/svg"
    class="grid-preview"
  >
    <rect :width="width" :height="height" fill="white" />
    <g v-for="(row, y) in cells" :key="y">
      <g v-for="(cell, x) in row" :key="x">
        <rect
          :x="x * cellSize"
          :y="y * cellSize"
          :width="cellSize"
          :height="cellSize"
          :fill="cell.definition ? '#e5e7eb' : 'white'"
          stroke="#cbd5e1"
          stroke-width="1"
        />
        <text
          v-if="!cell.definition && cell.text"
          :x="x * cellSize + cellSize / 2"
          :y="y * cellSize + cellSize / 2"
          text-anchor="middle"
          dominant-baseline="central"
          :font-size="cellSize * 0.7"
          fill="#1f2328"
        >
          {{ cell.text }}
        </text>
        <g
          v-if="cell.definition && cell.arrows"
          stroke="#ef4444"
          stroke-width="1.5"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path
            v-for="arrow in arrowsToDraw(cell)"
            :key="arrow.index"
            :d="arrowPath(arrow.dir, arrow.index)"
            :transform="arrowTransform(arrow.index)"
          />
        </g>
      </g>
    </g>
  </svg>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Cell, GridState } from "../types";

const props = withDefaults(defineProps<{ grid: GridState; cellSize?: number }>(), {
  cellSize: 18,
});

const cells = computed(() => props.grid.cells);
const width = computed(() => props.grid.cols * props.cellSize);
const height = computed(() => props.grid.rows * props.cellSize);

function arrowsToDraw(cell: Cell): { dir: string; index: number }[] {
  return (cell.arrows || [])
    .map((a, index) => ({ dir: a, index }))
    .filter((a) => a.dir !== "none");
}

function arrowTransform(i: number): string {
  // slot 0 -> right edge center, slot 2 -> right edge upper, slot 1 -> bottom center
  const s = props.cellSize;
  if (i === 1) return `translate(${s / 2}, ${s})`;
  return `translate(${s}, ${i === 2 ? s / 4 : s / 2})`;
}

function arrowPath(dir: string, i: number): string {
  const s = 6;
  if (dir === "down") {
    return `M 0 ${-s} L 0 ${s} M ${-s} ${s - s * 0.6} L 0 ${s} M ${s} ${s - s * 0.6} L 0 ${s}`;
  }
  if (dir === "rightdown" || dir === "downright") {
    return `M ${-s} ${-s} L ${s} ${-s} L ${s} ${s} M ${s} ${s - s * 0.6} L ${s} ${s} M ${s - s * 0.6} ${s} L ${s} ${s}`;
  }
  return `M ${-s} 0 L ${s} 0 M ${s - s * 0.6} ${-s * 0.6} L ${s} 0 M ${s - s * 0.6} ${s * 0.6} L ${s} 0`;
}
</script>

<style scoped>
.grid-preview {
  display: block;
  border: 1px solid var(--border);
  border-radius: 6px;
}
</style>
