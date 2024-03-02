<template>
  <div class="gridhighlightcontainer">
    <span v-if="false" class="lines">
      <span style="top: 102.5px; background-color: blue" />

      <span style="top: 56.6px" />
      <span style="top: 136px" />
    </span>
    <span v-if="false" class="v-lines">
      <span />
      <span style="transform: translate(10px,29px);" />
      <span style="transform: translate(20px,58px);" />
      <span style="transform: translate(30px,87px);" />
      <span style="transform: translate(40px,116px);" />
      <span style="transform: translate(50px,145px);" />
      <span style="transform: translate(60px,174px);" />
    </span>
    <span class="heatmap" v-if="mode === 'heatmap'">
      <canvas ref="heatmapref" />
    </span>
    <span v-for="({ style, key, problem }, i) in highlights" :class="`problem ${problem}`" :key="key" :style="style">
    </span>
    <span class="gridhighlight" v-if="visible && tooltip">
      <span class="highlight"> </span>
      <span class="tooltip" @mouseenter="hovered = true" @mouseleave="hovered = false" @mousemove="onMouseMove">
        <span v-if="tooltip === 'unknown'">
          <n-button @click="add" circle> + </n-button>
          {{ $t("tooltips.add", { word }) }}
        </span>
        <span v-if="tooltip === 'incomplete'">
          {{ word }} {{ $t("tooltips.incomplete") }}
        </span>
        <span v-if="tooltip === 'nodef'">
          {{ word }} {{ $t("tooltips.nodef") }}</span>
        <span v-if="tooltip === 'noarrow'">
          {{ word }} {{ $t("tooltips.noarrow") }}</span>
        <span v-if="tooltip === 'too-many-arrows'">
          {{ word }} {{ $t("tooltips.toomanyarrows") }}</span>
        <span v-if="tooltip === 'heatmap' && (hotLetters.length || cellHeat.length)">
          {{ hotLetters }}
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
  ref,
  toRaw,
  watch,
  watchEffect,
} from "vue";
import {
  Cell,
  CellProba,
  Direction,
  Grid,
  GridStyle,
  GridValidity,
  nullCell,
} from "grid";
import throttle from "lodash.throttle";
import {
  cellAndBorderSize,
  useTransform,
} from "./utils";
import chroma from "chroma-js";
import { api } from "../../api";
import { Mode } from "../../types";
import { workerController } from "../../worker";
import { onMounted } from "vue";


/**
 * Button to add words from the grid to the dictionnary
 */
const props = defineProps<{
  /**
   * The grid to edit
   */
  cell: Cell;
  cellProbas: CellProba[][];
  mode: Mode;
  grid: Grid;
  style: GridStyle;
  zoom: number;
  offset: [number, number];
  dir: Direction;
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
const hovered = ref(false);
const hotLetters = ref("");
const cellHeat = ref("");
const width = ref<string | number>(0);
const validity = ref<GridValidity>();
const height = ref<string | number>(0);
const visible = computed(() => {
  return !Grid.equal(props.cell, nullCell) && !props.cell.definition;
});
const cellWidth = ref(0);
const tooltip = ref<string>("");
function refreshValidity() {
  workerController.checkGrid(props.grid);
}
const throttledRefresValidity = throttle(refreshValidity, 60);
workerController.on("check-result", (data) => {
  validity.value = data;
});

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
  if (!bounds || !bounds.length || bounds.length === 1 || !validity.value) {
    transform.value = "";
    width.value = 0;
    height.value = 0;
    tooltip.value = "";
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
  const cellVal =
    validity.value[props.dir][`${bounds.start.y}-${bounds.start.x}`];
  tooltip.value = cellVal ? cellVal.problem : "";
});

const highlights = computed(() => {
  if (!validity.value || props.mode !== 'check') return [];
  const res = Object.entries(validity.value[props.dir])
    .map(([key, { problem }]) => {
      const [y, x] = key.split("-").map(Number);
      const bounds = props.grid.getBounds({ x, y }, props.dir);
      return {
        key,
        style: {
          width: cellAndBorderSize(
            props,
            props.dir === "horizontal" ? bounds.length : 1
          ),
          height: cellAndBorderSize(
            props,
            props.dir === "horizontal" ? 1 : bounds.length
          ),
          transform: useTransform(props, bounds.cells[0])
        },
        problem,
      };
    });
  return res;
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
    .filter(([_, proba]) => proba > 0.01)
    .map(([l, proba]) => `${l}: ${proba}`)
    .join(", ");
}

const colorScale = chroma.scale(["red", "#22C", "#014"]).mode("lab");
async function refreshHeatmap() {
  const inters = props.cellProbas.map((row) =>
    row.map(({ inter }) => Object.values(inter).reduce((acc, v) => acc + v, 0))
  );
  const { maxH, maxV } = inters.reduce(
    ({ maxV, maxH }, row) => ({
      maxH: Math.max(maxH, ...row.map((inter) => inter)),
      maxV: Math.max(maxV, ...row.map((inter) => inter)),
    }),
    { maxV: 0, maxH: 0 }
  );
  const norm = Math.log(Math.max(maxH, maxV));
  const colors = inters.map((row, y) =>
    row
      .map((inter, x) => {
        if (!props.cellProbas[y][x].empty) return null;
        return inter;
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
        if (!props.cellProbas[i][j].empty
          || props.grid.cells[i][j].definition
          || !color) return;
        const [r, g, b, a] = color;
        ctx.fillStyle = `rgba(${r},${g},${b},${a})`;

        ctx.fillRect(j * width, i * width, width, width);
      });
    });
  }
}

watchEffect(() => {
  hotLetters.value = getLetters(props.cell, props.cellProbas);
  refreshHeatmap();
});
watch(() => [props.mode, props.grid], () => {
  throttledRefresValidity();
});
onMounted(() => {
  throttledRefresValidity();
});
function onMouseMove(evt: MouseEvent) { }
function add() {
  api.db.pushWord(toRaw(word.value)).then(() => {
    tooltip.value = "";
    emit("update");
  });
}
/*
"rgba(255, 107, 107, 0.8)",
"rgba(255, 209, 102, 0.8)",
"rgba(6, 214, 160, 0.8)",
"rgba(17, 138, 178, 0.8)",
"rgba(255, 127, 80, 0.8)",
"rgba(94, 96, 206, 0.8)"
*/
</script>

<style>
.gridhighlightcontainer {
  pointer-events: none;
  display: grid;
}

.gridhighlightcontainer>* {
  grid-area: 1 / 1 / 1 / 1;
}

.gridhighlightcontainer>.gridhighlight {
  top: 0;
  left: 0;
  padding: 0;
  margin: 0;
  height: v-bind(height);
  max-height: v-bind(height);
  transform: v-bind(transform);
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  pointer-events: none;
}

.gridhighlightcontainer>.gridhighlight>.highlight {
  width: v-bind(width);
  height: v-bind(height);
  box-shadow: 0px 5px 10px 0px rgba(0, 0, 0, 0.5);
}

.gridhighlightcontainer>.gridhighlight>.tooltip {
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

.gridhighlightcontainer>.heatmap {
  position: relative;
  top: 0;
  left: 0;
  transform: v-bind(heatmapTransform);
  pointer-events: none;
}

.gridhighlightcontainer>.lines {
  position: relative;
}

.gridhighlightcontainer>.lines>span {
  width: 1500px;
  height: 1px;
  background-color: red;
  position: absolute;
}

.gridhighlightcontainer>.v-lines {
  position: relative;
}

.gridhighlightcontainer>.v-lines>span {
  left: 204px;
  width: 102px;
  height: 29px;
  background-color: red;
  position: absolute;
  opacity: 0.5;
}

.problem {
  z-index: -1;
}

.incomplete {
  background-color: rgba(255, 107, 107, 0.8);
}

.nodef {
  background-color: rgba(17, 138, 178, 0.8);
}

.noarrow {
  background-color: rgba(255, 209, 102, 0.8);
}

.too-many-arrows {
  background-color: rgba(6, 214, 160, 0.8);
}
</style>
