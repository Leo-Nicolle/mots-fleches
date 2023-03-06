<template>
  <svg
    ref="container"
    class="grid"
    :viewBox="`${-outerLineStroke} ${-outerLineStroke} ${gridTotalWidth(
      grid,
      options
    )} ${gridTotalHeight(grid, options)}`"
    :width="`${gridTotalWidth(grid, options)}px`"
    :height="`${gridTotalHeight(grid, options)}px`"
  >
    <rect
      :x="-outerLineStroke / 2"
      :y="-outerLineStroke / 2"
      :width="gridTotalWidth(grid, options) - outerLineStroke"
      :height="gridTotalHeight(grid, options) - outerLineStroke"
      class="outer-rect"
    />
    <g class="row" v-for="(row, i) in rows" :key="i">
      <g class="cell" v-for="(cell, j) in row" :key="j"></g>
    </g>
    <g class="lines">
      <line
        v-for="i in rows.length - 1"
        :key="i"
        :x1="0"
        :y1="i * cellWidth(options) + (i - 0.5) * borderWidth(options)"
        :x2="gridWidth(grid, options)"
        :y2="i * cellWidth(options) + (i - 0.5) * borderWidth(options)"
        class="line"
      />
      <line
        v-for="i in cols.length - 1"
        :key="i"
        :x1="i * cellWidth(options) + (i - 0.5) * borderWidth(options)"
        :y1="0"
        :x2="i * cellWidth(options) + (i - 0.5) * borderWidth(options)"
        :y2="gridHeight(grid, options)"
        class="line"
      />
    </g>
    <g class="cells">
      <g class="row" v-for="(row, i) in grid.cells" :key="i">
        <g class="cell" v-for="(cell, j) in row" :key="j">
          <rect
            :x="xText(cell) - cellWidth(options) / 2"
            :y="yText(cell)"
            :width="cellWidth(options)"
            :height="cellWidth(options)"
            fill="rgba(0,127,0,0.8)"
          />
          <text
            :x="xText(cell)"
            :y="yText(cell)"
            text-anchor="middle"
            alignment-baseline="middle"
            v-if="cell.definition"
          >
            <tspan v-for="(sp, k) in lines(cell)" :key="k" v-bind="sp">
              {{ sp.text }}
            </tspan>
          </text>
          <text
            :x="xText(cell)"
            :y="yText(cell) + 6 * cellWidth(options)/7"
            text-anchor="middle"
            class="text"
            v-else
          >
            {{ cell.text }}
          </text>
        </g>
      </g>
    </g>
  </svg>
</template>

<script setup lang="ts">
import { defineEmits, ref, defineProps, watchEffect, computed } from "vue";
import Arrow from "./Arrow";
import {
  Grid,
  GridOptions,
  gridWidth,
  gridHeight,
  gridTotalWidth,
  gridTotalHeight,
  cellAndBorderWidth,
  borderWidth,
  cellWidth,
  parse,
  Cell,
} from "grid";
import Vector from "vector2js";

const points = [
  [
    { x: 1, y: 0.5 },
    { x: 0.5, y: 1 },
  ],
  [
    { x: 1, y: 0.25 },
    { x: 1, y: 0.75 },
    { x: 0.5, y: 1 },
  ],
];

const container = ref(null);
const props = defineProps<{
  grid: Grid;
  options: GridOptions;
}>();
const rows = computed(() =>
  new Array(props.grid.rows).fill(0).map((e, i) => i)
);
const cols = computed(() =>
  new Array(props.grid.cols).fill(0).map((e, i) => i)
);
console.log({ rows, cols });
const lineStroke = computed(() => parse(props.options.grid.borderSize)[0]);
const lineColor = computed(() => props.options.grid.borderColor);
const outerLineStroke = computed(
  () => parse(props.options.grid.outerBorderSize)[0]
);
const outerLineColor = computed(() => props.options.grid.outerBorderColor);
const defSize = computed(() => parse(props.options.definition.size)[0]);
const textSize = computed(() => parse(props.options.grid.cellSize)[0]);
const textFont = computed(() => `${textSize.value}px roboto`);

function xText(cell: Cell) {
  return (
    cell.x * cellAndBorderWidth(props.options) + cellWidth(props.options) / 2
  );
}
function yText(cell: Cell) {
  return cell.y * cellAndBorderWidth(props.options);
}
function lines(cell: Cell) {
  if (!cell.definition) {
    const spacing = (cellWidth(props.options) - textSize.value) / 2;
    return [
      {
        text: cell.text,
        y: yText(cell),
        x: xText(cell),
        class: "text",
      },
    ];
  }
  const gaps = cell.text.split("\n\n");
  const height = cellWidth(props.options) / gaps.length;

  let lastSpacing = 0;
  const lines = gaps.reduce((acc, gap, i) => {
    const lines = gap.split("\n");
    const spacing =
      (height - defSize.value * lines.length) / (lines.length + 1);

    lines.forEach((line, j) => {
      acc.push({
        text: line,
        dy: spacing + defSize.value + +(j === 0) * lastSpacing,
        x: xText(cell),
        class: "definition",
      });
    });
    lastSpacing = spacing;
    return acc;
  }, [] as { text: string; dy: number; x: number; class: string }[]);
  return lines;
}

console.log(gridTotalWidth(props.grid, props.options));
</script>

<style scoped>
.line {
  fill: none;
  stroke-width: v-bind(lineStroke);
  stroke-miterlimit: 10;
  stroke: v-bind(lineColor);
}
.outer-rect {
  fill: none;
  stroke-width: v-bind(outerLineStroke);
  stroke-miterlimit: 10;
  stroke: v-bind(outerLineColor);
}
.definition {
  line-height: v-bind(defSize);
  font-size: v-bind(defSize);
}
.text {
  line-height: v-bind(textSize);
  font: v-bind(textFont);
}
</style>