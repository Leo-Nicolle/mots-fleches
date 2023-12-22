<template>
  <svg ref="container" class="grid" :viewBox="`${-outerLineStroke} ${-outerLineStroke} ${gridTotalWidth(
    grid,
    style
  )} ${gridTotalHeight(grid, style)}`" :width="`${gridTotalWidth(grid, style) / (zoom || 1)}px`"
    :height="`${gridTotalHeight(grid, style) / (zoom || 1)}px`" @click="onClick" @mousemove="onMouseMove"
    @mouseout="onMouseLeave" xmlns="http://www.w3.org/2000/svg">
    <FontLoader :value="style.definition" />
    <FontLoader v-if="isSolutionStyle(style)" :value="style.solutions" />
    <defs></defs>
    <g class="cells" text-anchor="middle" alignment-baseline="middle" dominant-baseline="hanging">
      <g v-for="(cell, i) in textCells" :key="i" :class="getCellClass(cell, focus)">
        <rect :x="cellAndBorderWidth(style) * cell.x" :y="cellAndBorderWidth(style) * cell.y" :width="cellWidth(style)"
          :height="cellWidth(style)" :fill="exportOptions.fills && cell.definition
            ? defBackgroundColor
            : 'none'
            " :class="highlights ? highlights.get(`${cell.y}-${cell.x}`) : ''" />
        <g v-if="cell.definition && exportOptions.definitions">
          <text v-for="(sp, k) in lines(cell)" :key="k" :line-height="defSize" :font-size="defSize"
            :font-family="defFontFamily" :font-weight="defFontWeight" :fill="defColor" v-bind="sp">
            {{ sp.text }}
          </text>
        </g>
        <text :x="xText(cell)" :y="yText(cell) + textSize / 2" alignment-baseline="central" dominant-baseline="center"
          :font-family="textFontFamily" :font-weight="textFontWeight" :fill="textFontColor" :font-size="textSize"
          v-else-if="!cell.definition && exportOptions.texts">
          {{ cell.text || cell.suggestion }}
        </text>
      </g>
    </g>
    <rect v-if="exportOptions.outerBorders" :x="-outerLineStroke / 2" :y="-outerLineStroke / 2"
      :width="gridTotalWidth(grid, style) - outerLineStroke" :height="gridTotalHeight(grid, style) - outerLineStroke"
      :stroke-width="outerLineStroke" :stroke="outerLineColor" fill="none" stroke-miterlimit="10" class="outerRect" />
    <g class="lines">
      <line v-for="i in rows.length - 1" :key="i" :x1="0" :y1="i * cellWidth(style) + (i - 0.5) * borderWidth(style)"
        :x2="gridWidth(grid, style)" :y2="i * cellWidth(style) + (i - 0.5) * borderWidth(style)" fill="none"
        :stroke-width="lineStroke" stroke-miterlimit="10" :stroke="lineColor" />
      <line v-for="i in cols.length - 1" :key="i" :x1="i * cellWidth(style) + (i - 0.5) * borderWidth(style)" :y1="0"
        :x2="i * cellWidth(style) + (i - 0.5) * borderWidth(style)" :y2="gridHeight(grid, style)" fill="none"
        :stroke-width="lineStroke" stroke-miterlimit="10" :stroke="lineColor" />
    </g>
    <g class="arrows" stroke-linecap="round" stroke-width="10" fill="none" :stroke="style.arrow.color"
      v-if="exportOptions.arrows">
      <g v-for="(arrow, i) in arrows" :key="i"
        :transform="`translate(${arrow.x},${arrow.y})scale(${arrowScale},${arrowScale})`">
        <path :class="arrow.dir" :d="getD(arrow.dir)" :transform="arrow.transform" />
      </g>
    </g>

    <g class="splits" v-if="exportOptions.splits">
      <line v-for="(line, i) in splits" :key="i" :x1="line.x1" :y1="line.y1" :x2="line.x2" :y2="line.y2" class="split"
        :stroke-width="lineStroke" stroke-miterlimit="10" :stroke="lineColor" />
    </g>
    <g class="spaces" v-if="exportOptions.spaces">
      <line v-for="(line, i) in spaces" :key="i" :x1="line.x1" :y1="line.y1" :x2="line.x2" :y2="line.y2" class="space"
        :stroke-width="spaceStroke" stroke-miterlimit="10" :stroke="lineColor" />
    </g>
  </svg>
</template>

<script setup lang="ts">
import FontLoader from "../fonts/FontLoader.vue";
import { defineEmits, ref, defineProps, computed, nextTick } from "vue";
import { getD } from "../../js/paths";
import {
  Grid,
  GridStyle,
  gridWidth,
  gridHeight,
  gridTotalWidth,
  gridTotalHeight,
  cellAndBorderWidth,
  borderWidth,
  cellWidth,
  Cell,
  nullCell,
  isSplited,
  splitIndex,
  getLines,
  arrowPositions,
  ArrowDir,
  SolutionStyle,
  isSolutionStyle,
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
  style: SolutionStyle | GridStyle;
  /**
   * The focused cell (can be nullCell)
   */
  focus: Cell;
  /**
   * What to display or not (arrows, definitions, etc.)
   */
  exportOptions: Partial<ExportOptions>;
  /**
   * Highlighted cells
   */
  highlights?: Map<string, string>;
  /**
   * The zoom level
   */
  zoom?: number;
}>();
const emit = defineEmits<{
  /**
   * Emitted when a cell is clicked
   */
  (event: "focus", value: Cell): void;
  /**
   * Emitted when mousemove on a cell
   */
  (event: "hover", value: Cell): void;
}>();
const rows = computed(() =>
  new Array(props.grid.rows).fill(0).map((e, i) => i)
);
const cols = computed(() =>
  new Array(props.grid.cols).fill(0).map((e, i) => i)
);
const textCells = computed(() =>
  props.grid.cells.flat().filter((c) => c.definition || props.exportOptions.texts)
);
const arrowScale = computed(() => 0.01 * props.style.arrow.size);
const lineStroke = computed(() => props.style.grid.borderSize);
const lineColor = computed(() => props.style.grid.borderColor);
const spaceStroke = computed(() => props.style.grid.spaceSize);
const outerLineStroke = computed(() => props.style.grid.outerBorderSize);
const outerLineColor = computed(() => props.style.grid.outerBorderColor);
const defSize = computed(
  () => (props.style.grid.cellSize / 4) * props.style.definition.size
);
const textSize = computed(() => {
  return (
    (isSolutionStyle(props.style) ? props.style.solutions.size : 1) *
    props.style.grid.cellSize
  );
});
const textFontFamily = computed(() => props.style.solutions.family);
const textFontWeight = computed(() => props.style.solutions.weight);
const textFontColor = computed(() => props.style.solutions.color);
const textTopOffset = computed(() => props.style.solutions.top);
const defFontFamily = computed(() => `${props.style.definition.family}`);
const defFontWeight = computed(() => `${props.style.definition.weight}`);

const defBackgroundColor = computed(
  () => props.style.definition.backgroundColor
);
const defColor = computed(() => props.style.definition.color);

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
                cellAndBorderWidth(props.style) * cell.x +
                cellAndBorderWidth(props.style) * x,
              y:
                cellAndBorderWidth(props.style) * cell.y +
                cellAndBorderWidth(props.style) * y,
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
        cell.y * cellAndBorderWidth(props.style) +
        ratio * cellWidth(props.style);
      return {
        x1: cell.x * cellAndBorderWidth(props.style),
        x2: cell.x * cellAndBorderWidth(props.style) + cellWidth(props.style),
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
      const xTop = cell.x * cellAndBorderWidth(props.style);
      const yTop = cell.y * cellAndBorderWidth(props.style);
      const width = cellWidth(props.style);
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
    }, [] as { x1: number; x2: number; y1: number; y2: number; }[]);
});

function xText(cell: Cell) {
  return cell.x * cellAndBorderWidth(props.style) + cellWidth(props.style) / 2;
}
function yText(cell: Cell) {
  return cell.y * cellAndBorderWidth(props.style);
}
/**
 * For a definition cell,
 * computes the lines to display
 */
function lines(cell: Cell) {
  const { text } = cell;
  const cellHeight = cellWidth(props.style);

  if (!cell.definition) {
    return [
      {
        text,
        y: yText(cell) + cellHeight / 2,
        x: xText(cell),
        class: "text",
        "dominant-baseline": "middle",
      },
    ];
  }
  const splited = isSplited(cell);
  const split = splitIndex(cell);
  const lines = getLines(cell);
  const ln = lines.length;
  const borderSize = props.style.grid.borderSize;
  const fourth = cellHeight / 4;
  const freeSpace = Math.max(0, cellHeight - (+splited * borderSize) - ln * fourth)
    / (ln + 1);
  return lines.map((line, i, arr) => {
    const y =
      cell.y * cellAndBorderWidth(props.style)
      + freeSpace * (i + 1)
      + i * fourth
      + (splited && i >= split) * (borderSize);
    const height = freeSpace / ln;
    return {
      text: line,
      x: xText(cell),
      y,
      height,
      "dominant-baseline": "hanging",
      class: "definition",
    };
  });
}

function getCell(evt: MouseEvent) {
  const x = evt.offsetX - outerLineStroke.value;
  const y = evt.offsetY - outerLineStroke.value;
  const maxX = gridTotalWidth(props.grid, props.style) / (props.zoom || 1);
  const maxY = gridTotalHeight(props.grid, props.style) / (props.zoom || 1);
  const cWidth =
    container.value && container.value.getBoundingClientRect()
      ? container.value.getBoundingClientRect().width
      : gridTotalWidth(props.grid, props.style);
  const ratio = cWidth / gridTotalWidth(props.grid, props.style);
  if (x < 0 || y < 0 || x > maxX || y > maxY) {
    return nullCell;
  }
  const cY = Math.floor(y / cellAndBorderWidth(props.style) / ratio);
  const cX = Math.floor(x / cellAndBorderWidth(props.style) / ratio);
  if (cX < 0 || cX > props.grid.cols - 1 || cY < 0 || cY > props.grid.rows - 1) return nullCell;
  return props.grid.cells[cY][cX];
}
function onClick(evt: MouseEvent) {
  const cell = getCell(evt);
  if (!cell) return;
  emit("focus", cell);
}

function onMouseMove(evt: MouseEvent) {
  const cell = getCell(evt);
  if (!cell) return;
  emit("hover", cell);
}
function onMouseLeave(evt: MouseEvent) {
  const cell = getCell(evt);
  if (!cell) return;
  emit("hover", cell);
}
</script>

<style></style>