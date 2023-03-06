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
  </svg>
</template>

<script setup lang="ts">
import {
  defineEmits,
  ref,
  defineProps,
  watchEffect,
  withDefaults,
  computed,
  watch,
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
} from "grid";
import { defaultExportOptions, ExportOptions, Rect } from "./types";

const container = ref<SVGSVGElement>(null as unknown as SVGSVGElement);
const focused = ref(nullCell);

const props = withDefaults(
  defineProps<{
    grid: Grid;
    dir: "row" | "col";
    options: GridOptions;
    exportOptions: Partial<ExportOptions>;
  }>(),
  {
    dir: "row",
    highlight: false,
    exportOptions: () => defaultExportOptions,
  }
);
const emit = defineEmits<{
  (event: "type", value: number): void;
  (event: "focus", value: Vec): void;
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
watchEffect(() => {
  const cells = props.grid.getBounds(focused.value, props.dir).cells;
  const width = cellWidth(props.options);
  const height = cellWidth(props.options);
  props.grid.highlight(cells);
  if (!container.value) return;
  if (props.grid.isValid(focused.value)) {
    emit("focus", focused.value);
  }
  // if (!cells.length) return;
  // if (props.grid.isDefinition(focused.value)) return;
  // const row = [...container.value.querySelectorAll(".row")][focused.value.y];
  // if (!row) return;
  // const col = [...row.querySelectorAll(".cell")][focused.value.x];
  // col.firstChild.focus();
  // props.grid.suggest([], [], []);
});

function getCellClass(cell: Cell) {
  const classes = [cell.definition ? "definition" : "text"];

  if (cell.x === focused.value.x && cell.y === focused.value.y) {
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
  return Grid.equal(cell, focused.value)
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

function onClick(evt: MouseEvent) {
  console.log(evt.x, evt.y);
  const x = evt.offsetX - outerLineStroke.value;
  const y = evt.offsetY - outerLineStroke.value;
  const maxX = gridTotalWidth(props.grid, props.options);
  const maxY = gridTotalHeight(props.grid, props.options);
  const cWidth =
    container.value && container.value.getBoundingClientRect()
      ? container.value.getBoundingClientRect().width
      : gridTotalWidth(props.grid, props.options);
  const ratio = cWidth / gridTotalWidth(props.grid, props.options);
  if (x < 0 || y < 0 || x > maxX || y > maxY) return (focused.value = nullCell);
  const cY = Math.floor(y / cellAndBorderWidth(props.options) / ratio);
  const cX = Math.floor(x / cellAndBorderWidth(props.options) / ratio);
  const cell = props.grid.cells[cY][cX];
  console.log(
    "ICI",
    { cX, cY },
    ratio,
    // cellWidth(props.options),
    // borderWidth(props.options),
    // cellAndBorderWidth(props.options),
    { x, y }
  );
  focused.value = cell;
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
.text.suggested  {
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