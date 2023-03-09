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
    @click="onClick"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      v-if="exportOptions.outerBorders"
      :x="-outerLineStroke / 2"
      :y="-outerLineStroke / 2"
      :width="gridTotalWidth(grid, options) - outerLineStroke"
      :height="gridTotalHeight(grid, options) - outerLineStroke"
      class="outer-rect"
    />
    <g class="lines" v-if="exportOptions.borders">
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
        <g class="cell" v-for="(cell, j) in row" :key="j"
        :class="getCellClass(cell)"
        >
          <rect
            :x="cellAndBorderWidth(options) * cell.x"
            :y="cellAndBorderWidth(options) * cell.y"
          />
          <text
            :x="xText(cell)"
            :y="yText(cell)"
            alignment-baseline="middle"
            v-if="cell.definition && exportOptions.definitions"
          >
            <tspan
              v-for="(sp, k) in lines(cell)"
              :key="k"
              v-bind="sp"
              :line-height="defSize"
              :font-size="defSize"
            >
              {{ sp.text }}
            </tspan>
          </text>
          <text
            :x="xText(cell)"
            :y="yText(cell) + (6 * cellWidth(options)) / 7"
            :class="getCellClass(cell)"
            v-else-if="!cell.definition && exportOptions.texts"
          >
            {{ cell.text || cell.suggestion }}
          </text>
        </g>
      </g>
    </g>

    <g
      class="arrows"
      stroke-linecap="round"
      stroke-width="10"
      :stroke="options.arrow.color"
      v-if="exportOptions.arrows"
    >

      <g v-for="(arrow, i) in arrows" 
      :key="i"
      :transform="`translate(${arrow.x},${
        arrow.y
      })scale(${arrowScale},${arrowScale})`"
        >
          <path 
          :class="arrow.dir" :d="getD(arrow.dir)" />
        </g>
    </g>

    <g class="splits" v-if="exportOptions.splits">
      <line
        v-for="(line, i) in splits"
        :key="i"
        :x1="line.x1"
        :y1="line.y1"
        :x2="line.x2"
        :y2="line.y2"
        class="line"
      />
    </g>
  </svg>
</template>

<script setup lang="ts">
import {
  defineEmits,
  ref,
  defineProps,
  withDefaults,
  computed,
} from "vue";
import { getD } from "../../js/paths";
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
  nullCell,
  Vec,
  isSplited,
  splitIndex,
  Direction,
  getLines,
  arrowPositions,
  ArrowDir
} from "grid";
import { defaultExportOptions, ExportOptions, Rect } from "./types";

const container = ref<SVGSVGElement>(null as unknown as SVGSVGElement);

const props = withDefaults(
  defineProps<{
    grid: Grid;
    dir: Direction;
    options: GridOptions;
    focus: Cell;
    exportOptions: Partial<ExportOptions>;
  }>(),
  {
    dir: "horizontal",
    focus: nullCell,
    highlight: false,
    exportOptions: () => defaultExportOptions,
  }
);
const emit = defineEmits<{
  (event: "type", value: number): void;
  (event: "focus", value: Cell): void;
}>();

const rows = computed(() =>
  new Array(props.grid.rows).fill(0).map((e, i) => i)
);
const cols = computed(() =>
  new Array(props.grid.cols).fill(0).map((e, i) => i)
);
const arrowScale = computed(() => 0.01 * parse(props.options.arrow.size)[0]);
const lineStroke = computed(() => parse(props.options.grid.borderSize)[0]);
const lineColor = computed(() => props.options.grid.borderColor);
const outerLineStroke = computed(
  () => parse(props.options.grid.outerBorderSize)[0]
);
const outerLineColor = computed(() => props.options.grid.outerBorderColor);
const defSize = computed(() => parse(props.options.definition.size)[0]);
const textSize = computed(() => parse(props.options.grid.cellSize)[0]);
const textFont = computed(() => `${textSize.value}px roboto`);
const defFont = computed(
  () => `${defSize.value}px ${props.options.definition.font}`
);
const defBackgroundColor = computed(
  () => props.options.definition.backgroundColor
);
const defColor = computed(() => props.options.definition.color);

const arrows = computed(() =>
  props.grid.cells.flat()
  .filter((c) => c.definition && c.arrows.length > 0)
  .map(cell => {
    return arrowPositions(cell).map(({x, y}, i) => {
    return cell.arrows[i] === 'none' ? null :{
      dir: cell.arrows[i],
      x: cellAndBorderWidth(props.options) * cell.x +
            cellWidth(props.options) * x,
      y:cellAndBorderWidth(props.options) * cell.y +
            cellWidth(props.options) * y
    };
  });
  })
  .flat()
  .filter(e => e) as unknown as {dir: ArrowDir, x: string, y: string}[]
);
function arrowPos(cell: Cell) {
  return;
}
const splits = computed(() =>
  props.grid.cells
    .flat()
    .filter((c) => c.definition && c.text.split("\n\n").length > 1)
    .map((cell) => {
      const lines = getLines(cell);
      const split = splitIndex(cell);
      const ratio =
        lines.length == 2 || lines.length === 4
          ? 0.5
          : split === 0
          ? 1 / 3
          : 0.66;
      const y =
        cell.y * cellAndBorderWidth(props.options) +
        ratio * cellWidth(props.options);
      return {
        x1: cell.x * cellAndBorderWidth(props.options),
        x2:
          cell.x * cellAndBorderWidth(props.options) + cellWidth(props.options),
        y1: y,
        y2: y,
      };
    })
);

function getCellClass(cell: Cell) {
  const classes = [cell.definition ? "definition" : "text"];

  if (cell.x === props.focus.x && cell.y === props.focus.y) {
    classes.push(`focused`);
  }
  if (cell.highlighted) {
    classes.push(`highlighted`);
  }
  if (cell.suggestion && !cell.text.length) {
    classes.push(`suggested`);
  }
  return classes.concat('cell').join(" ");
}

function getCellFill(cell: Cell) {
  if (cell.definition) {
    return props.options.definition.backgroundColor;
  }
  if (!props.exportOptions.highlight) return "transparent";
  return Grid.equal(cell, props.focus)
    ? "#acf"
    : cell.highlighted
    ? "#def"
    : "transparent";
}
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
    return [
      {
        text: cell.text,
        y: yText(cell),
        x: xText(cell),
        class: "text",
      },
    ];
  }
  const cellHeight = cellWidth(props.options);
  const splited = isSplited(cell);
  const split = splitIndex(cell);
  const lines = getLines(cell);
  const borderSize = parse(props.options.grid.borderSize)[0];
  const freeHeight =
    cellHeight - +splited * borderSize - lines.length * defSize.value;

  const topGaps = !splited
    ? new Array(lines.length).fill(1 / (lines.length + 1))
    : lines.length === 3
    ? split === 0
      ? [2 / 9, 7 / 18, 2 / 9]
      : [2 / 9, 2 / 9, 7 / 18]
    : lines.length === 2
    ? [1 / 4, 1 / 2]
    : [1 / 6, 1 / 6, 1 / 3, 1 / 6];
  const res = lines.map((line, i) => {
    return {
      text: line,
      "dominant-baseline": "middle",
      dy:
        (i === 0 ? defSize.value / 2 : defSize.value) + topGaps[i] * freeHeight,
      x: xText(cell),
      class: "definition",
    };
  });
  return res;
}

function onClick(evt: MouseEvent) {
  const x = evt.offsetX - outerLineStroke.value;
  const y = evt.offsetY - outerLineStroke.value;
  const maxX = gridTotalWidth(props.grid, props.options);
  const maxY = gridTotalHeight(props.grid, props.options);
  const cWidth =
    container.value && container.value.getBoundingClientRect()
      ? container.value.getBoundingClientRect().width
      : gridTotalWidth(props.grid, props.options);
  const ratio = cWidth / gridTotalWidth(props.grid, props.options);
  if (x < 0 || y < 0 || x > maxX || y > maxY) return emit("focus", nullCell);
  const cY = Math.floor(y / cellAndBorderWidth(props.options) / ratio);
  const cX = Math.floor(x / cellAndBorderWidth(props.options) / ratio);
  const cell = props.grid.cells[cY][cX];
  emit("focus", cell);
}
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

.text {
  font: v-bind(textFont);
}
.text.highlighted {
  fill: #000;
}
.text.suggested {
  fill: #777;
}
.text>rect{
  fill: none;
}
.cell> rect{
  width: v-bind(cellWidth(options));
  height: v-bind(cellWidth(options));
}
.cell>text{
  text-anchor:middle;
}
.text.highlighted>rect{
  fill: #def;
}
.definition>rect{
  fill: v-bind(defBackgroundColor);
}
.definition>text{
  fill: v-bind(defColor);
}
.definition>text>tspan {
  font: v-bind(defFont);
}
.right .rightdown {
  transform: rotate(180deg) scale(-1, -1);
}
.downright,
.down {
  transform: scale(-1, 1) rotate(90deg);
}
</style>