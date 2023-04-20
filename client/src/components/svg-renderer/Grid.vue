<template>
  <svg
    ref="container"
    class="grid"
    :viewBox="`${-outerLineStroke} ${-outerLineStroke} ${gridTotalWidth(
      grid,
      options
    )} ${gridTotalHeight(grid, options)}`"
    :width="`${gridTotalWidth(grid, options) / (zoom || 1)}px`"
    :height="`${gridTotalHeight(grid, options) / (zoom || 1)}px`"
    @click="onClick"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs></defs>
    <g
      class="cells"
      text-anchor="middle"
      alignment-baseline="middle"
      dominant-baseline="middle"
    >
      <g class="row" v-for="(row, i) in grid.cells" :key="i">
        <g
          class="cell"
          v-for="(cell, j) in row"
          :key="j"
          :class="getCellClass(cell, focus)"
        >
          <rect
            :x="cellAndBorderWidth(options) * cell.x"
            :y="cellAndBorderWidth(options) * cell.y"
            :width="cellWidth(options)"
            :height="cellWidth(options)"
            :fill="cell.definition ? defBackgroundColor : 'none'"
          />
          <text
            :x="xText(cell)"
            :y="yText(cell)"
            v-if="cell.definition && exportOptions.definitions"
          >
            <tspan
              v-for="(sp, k) in lines(cell)"
              :key="k"
              v-bind="sp"
              :line-height="defSize"
              :font-size="defSize"
              :font-family="defFont"
              :fill="defColor"
            >
              {{ sp.text }}
            </tspan>
          </text>
          <text
            :x="xText(cell)"
            :y="yText(cell) + (6 * cellWidth(options)) / 7"
            :font-family="textFont"
            :font-size="textSize"
            dominant-baseline="alphabetic"
            v-else-if="!cell.definition && exportOptions.texts"
          >
            {{ cell.text || cell.suggestion }}
          </text>
        </g>
      </g>
    </g>
    <rect
      v-if="exportOptions.outerBorders"
      :x="-outerLineStroke / 2"
      :y="-outerLineStroke / 2"
      :width="gridTotalWidth(grid, options) - outerLineStroke"
      :height="gridTotalHeight(grid, options) - outerLineStroke"
      :stroke-width="outerLineStroke"
      :stroke="outerLineColor"
      fill="none"
      stroke-miterlimit="10"
      class="outerRect"
    />
    <g class="lines" v-if="exportOptions.borders">
      <line
        v-for="i in rows.length - 1"
        :key="i"
        :x1="0"
        :y1="i * cellWidth(options) + (i - 0.5) * borderWidth(options)"
        :x2="gridWidth(grid, options)"
        :y2="i * cellWidth(options) + (i - 0.5) * borderWidth(options)"
        fill="none"
        :stroke-width="lineStroke"
        stroke-miterlimit="10"
        :stroke="lineColor"
      />
      <line
        v-for="i in cols.length - 1"
        :key="i"
        :x1="i * cellWidth(options) + (i - 0.5) * borderWidth(options)"
        :y1="0"
        :x2="i * cellWidth(options) + (i - 0.5) * borderWidth(options)"
        :y2="gridHeight(grid, options)"
        fill="none"
        :stroke-width="lineStroke"
        stroke-miterlimit="10"
        :stroke="lineColor"
      />
    </g>
    <g
      class="arrows"
      stroke-linecap="round"
      stroke-width="10"
      fill="none"
      :stroke="options.arrow.color"
      v-if="exportOptions.arrows"
    >
      <g
        v-for="(arrow, i) in arrows"
        :key="i"
        :transform="`translate(${arrow.x},${arrow.y})scale(${arrowScale},${arrowScale})`"
      >
        <path
          :class="arrow.dir"
          :d="getD(arrow.dir)"
          :transform="arrow.transform"
        />
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
        class="split"
        :stroke-width="lineStroke"
        stroke-miterlimit="10"
        :stroke="lineColor"
      />
    </g>
    <g class="spaces" v-if="exportOptions.spaces">
      <line
        v-for="(line, i) in spaces"
        :key="i"
        :x1="line.x1"
        :y1="line.y1"
        :x2="line.x2"
        :y2="line.y2"
        class="space"
        :stroke-width="spaceStroke"
        stroke-miterlimit="10"
        :stroke="lineColor"
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
  onUpdated,
  watchEffect,
  onMounted,
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
  isSplited,
  splitIndex,
  Direction,
  getLines,
  arrowPositions,
  ArrowDir,
} from "grid";
import { ExportOptions } from "../../types";
import { getCellClass } from "../../js/utils";
/**
 * Component to render a grid as an SVG
 */
const container = ref<SVGSVGElement>(null as unknown as SVGSVGElement);
const props = defineProps<{
  /**
   * The grid to render
   */
  grid: Grid;
  /**
   * The style of the grid
   */
  options: GridOptions;
  /**
   * The focused cell (can be nullCell)
   */
  focus: Cell;
  /**
   * What to display or not (arrows, definitions, etc.)
   */
  exportOptions: Partial<ExportOptions>;

  zoom?: number;
}>();
const emit = defineEmits<{
  /**
   * Emitted when a cell is clicked
   */
  (event: "focus", value: Cell): void;
}>();
const rows = computed(() =>
  new Array(props.grid.rows).fill(0).map((e, i) => i)
);
const cols = computed(() =>
  new Array(props.grid.cols).fill(0).map((e, i) => i)
);
const arrowScale = computed(() => 0.01 * props.options.arrow.size);
const lineStroke = computed(() => props.options.grid.borderSize);
const lineColor = computed(() => props.options.grid.borderColor);
const spaceStroke = computed(() => 4);
const outerLineStroke = computed(() => props.options.grid.outerBorderSize);
const outerLineColor = computed(() => props.options.grid.outerBorderColor);
const defSize = computed(() => props.options.definition.size);
const textSize = computed(() => props.options.grid.cellSize);
const textFont = computed(() => `roboto`);
const defFont = computed(() => `${props.options.definition.font}`);
const defBackgroundColor = computed(
  () => props.options.definition.backgroundColor
);
const defColor = computed(() => props.options.definition.color);

/**
 * The arrows to display
 */
const arrows = computed(
  () =>
    props.grid.cells
      .flat()
      .filter((c) => c.definition && c.arrows.length > 0)
      .map((cell) => {
        return arrowPositions(cell).map(({ x, y }, i) => {
          return cell.arrows[i] === "none"
            ? null
            : {
                dir: cell.arrows[i],
                x:
                  cellAndBorderWidth(props.options) * cell.x +
                  cellAndBorderWidth(props.options) * x,
                y:
                  cellAndBorderWidth(props.options) * cell.y +
                  cellAndBorderWidth(props.options) * y,
                transform: cell.arrows[i].startsWith("right")
                  ? "rotate(180)scale(-1, -1)"
                  : "scale(-1, 1)rotate(90)",
              };
        });
      })
      .flat()
      .filter((e) => e) as unknown as {
      dir: ArrowDir;
      x: string;
      y: string;
      transform: string;
    }[]
);
/**
 * The splits to display
 */
const splits = computed(() =>
  props.grid.cells
    .flat()
    .filter((c) => c.definition && c.text.split("\n\n").length > 1)
    .map((cell) => {
      const lines = getLines(cell).length;
      const split = splitIndex(cell);
      const ratio =
        lines === 4
          ? split === 2
            ? 0.5
            : split === 1
            ? 1 / 4
            : 3 / 4
          : lines === 3
          ? split === 1
            ? 1 / 3
            : 2 / 3
          : lines === 2
          ? split === 1
            ? 0.5
            : 0
          : 0;
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
/**
 * The spaces to display
 */
const spaces = computed(() => {
  return props.grid.cells
    .flat()
    .filter((c) => !c.definition && (c.spaceH || c.spaceV))
    .reduce((spaces, cell) => {
      const xTop = cell.x * cellAndBorderWidth(props.options);
      const yTop = cell.y * cellAndBorderWidth(props.options);
      const width = cellWidth(props.options);
      if (cell.spaceH) {
        spaces.push({
          x1: xTop + width,
          x2: xTop + width,
          y1: yTop,
          y2: yTop + width,
        });
      }
      if (cell.spaceV) {
        spaces.push({
          y1: yTop + width,
          y2: yTop + width,
          x1: xTop,
          x2: xTop + width,
        });
      }
      return spaces;
    }, [] as { x1: number; x2: number; y1: number; y2: number }[]);
});

function xText(cell: Cell) {
  return (
    cell.x * cellAndBorderWidth(props.options) + cellWidth(props.options) / 2
  );
}
function yText(cell: Cell) {
  return cell.y * cellAndBorderWidth(props.options);
}
/**
 * For a definition cell,
 * computes the lines to display
 */
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
  const borderSize = props.options.grid.borderSize;
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
  const maxX = gridTotalWidth(props.grid, props.options) / (props.zoom || 1);
  const maxY = gridTotalHeight(props.grid, props.options)/ (props.zoom || 1);
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
.text.highlighted {
  fill: #000;
}
.text.suggested {
  fill: #777;
}
.text.highlighted > rect {
  fill: #def;
}
</style>