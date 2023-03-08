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
        <g class="cell" v-for="(cell, j) in row" :key="j">
          <rect
            :x="cellAndBorderWidth(options) * cell.x"
            :y="cellAndBorderWidth(options) * cell.y"
            :width="cellWidth(options)"
            :height="cellWidth(options)"
            :fill="getCellFill(cell)"
          />
          <text
            :x="xText(cell)"
            :y="yText(cell)"
            text-anchor="middle"
            alignment-baseline="middle"
            :class="getCellClass(cell)"
            v-if="cell.definition && exportOptions.definitions"
          >
            <tspan
              v-for="(sp, k) in lines(cell)"
              :key="k"
              v-bind="sp"
              class="definition"
            >
              {{ sp.text }}
            </tspan>
          </text>
          <text
            :x="xText(cell)"
            :y="yText(cell) + (6 * cellWidth(options)) / 7"
            text-anchor="middle"
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
      fill="none"
      stroke="black"
      v-if="exportOptions.arrows"
    >
      <g v-for="(cell, i) in cellsWithArrows" :key="i">
        <g
          v-for="(arrow, j) in cell.arrows"
          :key="j"
          :transform="`translate(${
            cellAndBorderWidth(options) * cell.x +
            cellWidth(options) * arrow.position.x
          },${
            cellAndBorderWidth(options) * cell.y +
            cellWidth(options) * arrow.position.y
          })scale(0.14,0.14)`"
        >
          <path :class="arrow.direction" :d="getD(arrow.direction, true)" />
        </g>
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
  Direction,
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

const cellsWithArrows = computed(() =>
  props.grid.cells.flat().filter((c) => c.definition && c.arrows.length > 0)
);
const splits = computed(() =>
  props.grid.cells
    .flat()
    .filter((c) => c.definition && c.text.split("\n\n").length > 1)
    .map((cell) => {
      let isSplited = false;
      let splitIndex = 0;
      const lines = cell.text.split("\n\n").reduce((lines, s, i, blocks) => {
        isSplited = blocks.length > 1;
        const linesInBlock = s.split("\n");
        if (i === 0) {
          splitIndex = linesInBlock.length - 1;
        }
        lines.push(...linesInBlock);
        return lines;
      }, [] as string[]);

      const ratio =
        lines.length == 2 || lines.length === 4
          ? 0.5
          : splitIndex === 0
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
  return classes.join(" ");
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

  let isSplited = false;
  let splitIndex = 0;
  const lines = cell.text.split("\n\n").reduce((lines, s, i, blocks) => {
    isSplited = blocks.length > 1;
    const linesInBlock = s.split("\n");
    if (i === 0) {
      splitIndex = linesInBlock.length - 1;
    }
    lines.push(...linesInBlock);
    return lines;
  }, [] as string[]);
  const borderSize = parse(props.options.grid.borderSize)[0];
  const freeHeight =
    cellHeight - +isSplited * borderSize - lines.length * defSize.value;

  const topGaps = !isSplited
    ? new Array(lines.length).fill(1 / (lines.length + 1))
    : lines.length === 3
    ? splitIndex === 0
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
.definition {
  line-height: v-bind(defSize);
  font-size: v-bind(defSize);
  font: v-bind(defFont);
}
.text {
  line-height: v-bind(textSize);
  font: v-bind(textFont);
}
.text.highlighted {
  fill: #000;
}
.text.suggested {
  fill: #777;
}

.right .rightdown {
  transform: rotate(180deg) scale(-1, -1);
}
.downright,
.down {
  transform: scale(-1, 1) rotate(90deg);
}
</style>