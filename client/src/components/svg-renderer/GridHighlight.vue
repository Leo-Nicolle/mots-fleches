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
        <span v-if="tooltip === 'heatmap'"> {{ hotLetters }}</span>
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
  Direction,
  getWords,
  Grid,
  GridOptions,
  GridValidity,
  nullCell,
} from "grid";
import { getUrl } from "../../js/utils";
import axios from "axios";
import {
  cellAndBorderSize,
  cellSize,
  useSvgSizes,
  useTransform,
} from "./utils";
import HeatMap from "jsheatmap";

type CellProba = {
  empty: boolean;
  horizontalL: Record<string, number>;
  verticalL: Record<string, number>;
  inter: Record<string, number>;
  totalInter: number;
  horizontal: number;
  vertical: number;
  validH: boolean;
  validV: boolean;
  x: number;
  y: number;
};
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
const width = ref<string | number>(0);
const height = ref<string | number>(0);
const visible = computed(() => {
  return !Grid.equal(props.cell, nullCell) && !props.cell.definition;
});
const tooltip = ref<string>("");
watchEffect(() => {
  if (hovered.value) return;
  if (props.mode === "heatmap") {
    width.value = cellAndBorderSize(props, 1);
    height.value = cellAndBorderSize(props, 1);
    word.value = "";
    transform.value = useTransform(props, props.cell);
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

async function heatmap(grid: Grid) {
  if (!grid) return [[]];
  const cellMap = grid.cells.reduce((acc, _, y) => {
    acc.push(
      new Array(grid.cols).fill(0).map((_, x) => ({
        horizontalL: {},
        verticalL: {},
        inter: {},
        empty: false,
        horizontal: 0,
        validH: false,
        validV: false,
        totalInter: 0,
        x,
        y,
        vertical: 0,
      }))
    );
    return acc;
  }, [] as CellProba[][]);

  const dirs = ["horizontal", "vertical"] as Direction[];
  for (let d = 0; d < dirs.length; d++) {
    const dir = dirs[d];
    const vec = Grid.getDirVec(dir);
    const allBounds = grid.getWords(dir).filter(({ length }) => length > 1);
    const allWords = await Promise.all(
      allBounds.map(async (bounds) => {
        const words = await axios.post(getUrl("search"), {
          gridId: grid.id,
          coord: bounds.start,
          dir: dir,
          ordering: 1,
          query: "",
          method: "simple",
          max: 100,
        });
        return words.data.words as string[];
      })
    );
    // get all letters possible per cell
    allBounds.forEach((bounds, i) => {
      const words = allWords[i];
      const emptyCells = bounds.cells.map((cell, i) => (cell.text ? null : i));
      const valid = dir === "horizontal" ? "validH" : "validV";
      bounds.cells.forEach((cell) => {
        cellMap[cell.y][cell.x][valid] = true;
      });
      words.forEach((word) => {
        word.split("").forEach((letter, i) => {
          if (emptyCells[i] === null) return;
          const elt =
            cellMap[bounds.start.y + i * vec.y][bounds.start.x + i * vec.x];
          elt.empty = true;
          const letters = elt[(dir + "L") as "horizontalL" | "verticalL"];
          letters[letter] = letters[letter] ? letters[letter] + 1 : 1;
          elt[dir] = elt[dir] ? elt[dir] + 1 : 1;
        });
      });
    }, {});
  }
  // find intersection betwen horizontal and vertical
  cellMap.forEach((row, y) => {
    row.forEach(({ horizontalL, verticalL, empty, validH, validV }, x) => {
      if (!empty) return;
      if (validV && validH) {
        row[x].inter = Object.keys(horizontalL).reduce((acc, letter) => {
          if (verticalL[letter]) {
            acc[letter] = horizontalL[letter] + verticalL[letter];
          }
          return acc;
        }, {} as Record<string, number>);
      } else if (!validV) {
        row[x].inter = horizontalL;
      } else if (!validH) {
        row[x].inter = verticalL;
      }
    });
  });
  cellMap.forEach((row, y) => {
    row.forEach(({ inter }, x) => {
      row[x].totalInter = Object.values(inter).reduce((acc, v) => acc + v, 0);
    });
  });

  return cellMap;
}

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
watchEffect(async () => {
  if (props.mode !== "heatmap" || !props.grid) {
    heatmapLetters.value = [[]];
  }
  console.log("heatmap");
  const cellMap = await heatmap(props.grid);
  heatmapLetters.value = cellMap;
  const max = cellMap.reduce(
    (acc, row) =>
      Math.max(acc, ...row.map(({ totalInter }) => Math.max(acc, totalInter))),
    0
  );
  const headings = new Array(props.grid.cols).fill(0).map((_, i) => `${i}`);
  const rows = new Array(props.grid.rows).fill(0).map((_, i) => [
    `${i}`,
    [
      ...cellMap[i].map(({ inter, empty }) => {
        if (!empty) return 0;
        const letter = Object.values(inter).reduce((acc, letter) => {
          return acc + letter;
        }, 0);
        return max - letter;
      }),
    ],
  ]);
  const colors = new HeatMap(headings, rows)
    .getData()
    .rows.map((row, y) =>
      row.cells.colors
        .map((color, x) =>
          cellMap[y][x].totalInter === 0
            ? { red: 0, green: 0, blue: 0, alpha: 0.6 }
            : { ...color, alpha: 0.5 }
        )
        .map(
          ({ red, green, blue, alpha }) =>
            `rgba(${red * 255}, ${green * 255}, ${blue * 255}, ${alpha})`
        )
    ) as string[][];
  const canvas = heatmapref.value;
  if (canvas) {
    const width = Number(cellAndBorderSize(props, 1).slice(0, -2));
    canvas.width = width * props.grid.cols;
    canvas.height = width * props.grid.rows;
    canvas.style.width = `${width * props.grid.cols}px`;
    canvas.style.height = `${width * props.grid.rows}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    colors.forEach((row, i) => {
      row.forEach((color, j) => {
        if (!cellMap[i][j].empty) return;
        ctx.fillStyle = color;
        ctx.fillRect(j * width, i * width, width, width);
      });
    });
  }
  heatmapTransform.value = useTransform(props, props.grid.cells[0][0]);
});

watchEffect(() => {
  hotLetters.value = getLetters(props.cell, heatmapLetters.value);
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