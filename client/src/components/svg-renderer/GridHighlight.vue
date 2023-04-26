<template>
  <div>
    <span class="heatmap" v-if="mode === 'heatmap'">
      <canvas ref="heatmapref" />
    </span>

    <span class="gridhighlight" v-if="visible">
      <span class="highlight"> </span>
      <span
        class="tooltip"
        @mouseenter="hovered = true"
        @mouseleave="hovered = false"
        @mousemove="onMouseMove"
      >
        <span v-if="tooltip === 'unknown'">
          <n-button @click="add" circle> + </n-button>
          {{ $t("tooltips.add", { word }) }}
        </span>
        <span v-if="tooltip === 'incomplete'">
          {{ word }} {{ $t("tooltips.incomplete") }}
        </span>
        <span v-if="tooltip === 'nodef'">
          {{ word }} {{ $t("tooltips.nodef") }}</span
        >
        <span v-if="tooltip === 'noarrow'">
          {{ word }} {{ $t("tooltips.noarrow") }}</span
        >
        <span
          v-if="tooltip === 'heatmap' && (hotLetters.length || cellHeat.length)"
        >
          {{ hotLetters }}
          <br />
          {{ cellHeat }}
        </span>
      </span>
    </span>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  defineEmits,
  defineProps,
  nextTick,
  ref,
  watch,
  watchEffect,
} from "vue";
import {
  Cell,
  CellProba,
  Direction,
  getWords,
  Grid,
  GridOptions,
  GridValidity,
  nullCell,
} from "grid";
import { getUrl } from "../../js/utils";
import axios from "axios";
import throttle from "lodash.throttle";
import {
  cellAndBorderSize,
  cellSize,
  useSvgSizes,
  useTransform,
} from "./utils";
// import HeatMap from "jsheatmap";
import chroma from "chroma-js";

export type Mode = "normal" | "check" | "heatmap";

/**
 * Button to add words from the grid to the dictionnary
 */
const props = defineProps<{
  /**
   * The grid to edit
   */
  cell: Cell;
  mode: Mode;
  grid: Grid;
  gridVersion: number;
  options: GridOptions;
  zoom: number;
  offset: [number, number];
  dir: Direction;
  validity?: GridValidity;
}>();
const emit = defineEmits<{
  /**
   * The grid has been updated
   */
  (event: "update"): void;
}>();
const word = ref("");
const heatmapref = ref<HTMLCanvasElement>(null);
const heatmapTransform = ref("");
const transform = ref("");
const heatmapLetters = ref<CellProba[][]>([[]]);
const hovered = ref(false);
const hotLetters = ref("");
const cellHeat = ref("");
const width = ref<string | number>(0);
const height = ref<string | number>(0);
const visible = computed(() => {
  return !Grid.equal(props.cell, nullCell) && !props.cell.definition;
});
const cellWidth = ref(0);
const tooltip = ref<string>("");
watchEffect(() => {
  if (hovered.value) return;
  if (props.mode === "heatmap") {
    width.value = cellAndBorderSize(props, 1);
    height.value = cellAndBorderSize(props, 1);
    word.value = "";
    transform.value = useTransform(props, props.cell);
    heatmapTransform.value = useTransform(props, props.grid.cells[0][0]);
    cellWidth.value = Number(cellAndBorderSize(props, 1).slice(0, -2));
    tooltip.value = "heatmap";
    return;
  }
  const bounds = props.grid.getBounds(props.cell, props.dir);
  if (!bounds || !bounds.length || bounds.length === 1 || !props.validity) {
    transform.value = "";
    width.value = 0;
    height.value = 0;
    return;
  }
  const { cells, length } = bounds;
  word.value = cells.map((cell) => cell.text).join("");
  width.value = cellAndBorderSize(
    props,
    props.dir === "horizontal" ? length : 1
  );
  height.value = cellAndBorderSize(
    props,
    props.dir === "horizontal" ? 1 : length
  );
  transform.value = useTransform(props, cells[0]);
  const validity =
    props.validity[props.dir][`${bounds.start.y}-${bounds.start.x}`];
  tooltip.value = validity ? validity.problem : "";
});

function getLetters(cell: Cell, heatmapLetters: CellProba[][]) {
  if (!heatmapLetters || !cell) return "";
  const row = heatmapLetters[cell.y];
  if (!row) return "";
  const cellHeatmap = row[cell.x];
  if (!cellHeatmap) return "";
  const letters = Object.entries(cellHeatmap.inter).sort(
    ([_, a], [__, b]) => b - a
  );
  return letters
    .slice(0, 5)
    .map(([l, proba]) => `${l}: ${proba}`)
    .join(", ");
}

function getHeat(cell: Cell, heatmapLetters: CellProba[][]) {
  if (!heatmapLetters || !cell) return "";
  const row = heatmapLetters[cell.y];
  if (!row) return "";
  const cellHeatmap = row[cell.x];
  if (!cellHeatmap) return "";
  const { horizontal, vertical, validH, validV, empty } = cellHeatmap;
  if ((!validH && !validV) || !empty) return "";
  if (validH && validV)
    return `Horizontal: ${horizontal}, Vertical: ${vertical}`;
  if (!validV) return `Horizontal: ${horizontal}`;
  if (!validH) return `Vertical: ${vertical}`;
}

const colorScale = chroma.scale(["red", "#22C", "#014"]).mode("lab");
async function refreshHeatmap() {
  if (props.mode !== "heatmap" || !props.grid) {
    heatmapLetters.value = [[]];
  }
  let cellMap: CellProba[][] = [];
  try {
    const { data, status } = (await axios.post(getUrl("heatmap"), {
      grid: props.grid.serialize(),
    })) as { data: CellProba[][]; status: number };
    if (status !== 200) return;
    cellMap = data;
  } catch (e) {
    heatmapLetters.value = [[]];
  }
  heatmapLetters.value = cellMap;
  console.log("heatmap");
  const { maxH, maxV } = cellMap.reduce(
    ({ maxV, maxH }, row) => ({
      maxH: Math.max(maxH, ...row.map(({ horizontal }) => horizontal)),
      maxV: Math.max(maxV, ...row.map(({ vertical }) => vertical)),
    }),
    { maxV: 0, maxH: 0 }
  );
  const norm = Math.log(Math.max(maxH, maxV));
  const colors = cellMap.map((row, i) =>
    row
      .map(({ inter, empty, horizontal, vertical, validH, validV }) => {
        if (!empty) return null;
        if (validH && validV) {
          return Math.min(horizontal, vertical);
        }
        if (!validV) {
          return horizontal;
        }
        if (!validH) {
          return vertical;
        }
        return 0;
      })
      .map((v) => {
        if (v === null) {
          return null;
        }

        if (v === 0) {
          return [0, 0, 0, 0.7];
        }
        return [...colorScale(Math.log(v) / norm).rgb(), 0.5];
      })
  );
  const canvas = heatmapref.value;
  const width = cellWidth.value;
  if (canvas && width) {
    canvas.width = width * props.grid.cols;
    canvas.height = width * props.grid.rows;
    canvas.style.width = `${width * props.grid.cols}px`;
    canvas.style.height = `${width * props.grid.rows}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    colors.forEach((row, i) => {
      row.forEach((color, j) => {
        if (!cellMap[i][j].empty || !color) return;
        const [r, g, b, a] = color;
        ctx.fillStyle = `rgba(${r},${g},${b},${a})`;

        ctx.fillRect(j * width, i * width, width, width);
      });
    });
  }
}
const throttledRefreshHeatmap = throttle(refreshHeatmap, 1000);
watch(
  () => [props.grid, props.mode, props.gridVersion],
  async () => {
    throttledRefreshHeatmap();
  }
);

watchEffect(() => {
  hotLetters.value = getLetters(props.cell, heatmapLetters.value);
  cellHeat.value = getHeat(props.cell, heatmapLetters.value);
});
function onMouseMove(evt: MouseEvent) {}
function add() {
  axios
    .post(getUrl("word"), {
      word: word.value,
    })
    .then(() => {
      tooltip.value = "";
      emit("update");
    });
}
</script>

<style scoped>
.gridhighlight {
  position: absolute;
  top: 0;
  left: 0;
  padding: 0;
  margin: 0;
  height: v-bind(height);
  max-height: v-bind(height);
  transform: v-bind(transform);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
.highlight {
  width: v-bind(width);
  height: v-bind(height);
  box-shadow: 0px 5px 10px 0px rgba(0, 0, 0, 0.5);
}
.gridhighlight > .tooltip {
  pointer-events: visible;
  padding: 4px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 0 3px 0 rgba(0, 0, 0, 0.5);
  margin-left: -5px;
  margin-top: 5px;
  display: flex;
  align-content: flex-start;
  align-items: center;
  gap: 4px;
}
.heatmap {
  position: absolute;
  top: 0;
  left: 0;
  transform: v-bind(heatmapTransform);
  pointer-events: none;
}
</style>