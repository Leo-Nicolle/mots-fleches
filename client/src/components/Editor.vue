<template>
  <Layout @scroll="onScroll" :left-panel-scroll="highlightMode !== 'autofill'">
    <template #left-panel>
      <span class="title">
        <h2>
          {{ grid.title ? grid.title : $t("buttons.newGrid") }}
        </h2>
        <ModalOptions :modelValue="grid" @update-size="emit('size-update')" @update:model-value="emit('update')"
          @open="focus = nullCell" />
      </span>
      <span>
        <n-button @click="onModeClick">
          {{ $t(`modes.${highlightMode}`) }}
        </n-button>
      </span>
      <Buttons v-model:dir="dir" v-model:method="method" v-model:ordering="ordering" :mode="highlightMode"></Buttons>
      <Autofill v-if="highlightMode === 'autofill'" :grid="grid" />
      <Suggestion v-else-if="!focus.definition" :point="focus" :dir="dir" :grid-id="grid.id" :method="method"
        :ordering="ordering" :cellProbas="cellProbas" :searchResult="searchResult" :loading="isLoadingSuggestions"
        @hover="onHover" @click="onClick" @mouseout="onMouseOut">
      </Suggestion>
      <Definition v-else-if="focus.definition" :grid="grid" :focus="focus" :dir="dir" />
    </template>
    <template #body>
      <div class="container" ref="container">
        <div class="controls">
          <n-button class="zoom-controls" @click="resetGrid">
            Reset
          </n-button>
          <span class="zoom-controls">
            Zoom
            <n-button @click="onZoomIn" circle>
              <n-icon>
                <AddCircleOutline />
              </n-icon>
            </n-button>
            <n-button @click="onZoomOut" circle>
              <n-icon>
                <RemoveCircleOutline />
              </n-icon>
            </n-button>
          </span>
        </div>
        <div class="superpose">
          <SVGGrid @focus="(cell) => (focus = cell)" @hover="(cell) => (hoveredCell = cell)" :grid="grid" :focus="focus"
            :dir="dir" :style="style" :zoom="1 / zoom" class="svg-grid" :export-options="{
              ...defaultExportOptions,
              texts: true,
              highlight: true,
            }"></SVGGrid>
          <GridHighlight :grid="grid" :style="style" :cell="hoveredCell" :cellProbas="cellProbas" :zoom="zoom"
            :mode="highlightMode" :gridVersion="gridVersion" :offset="offset" :dir="dir" @update="onGridUpdate()" />
          <GridInput :grid="grid" :dir="dir" :style="style" :cell="focus" :offset="offset" :zoom="zoom"
            @focus="(point) => (focus = point)" @update="onGridUpdate()" @keyup="onKeyUp">
          </GridInput>
        </div>
      </div>
    </template>
  </Layout>
</template>

<script setup lang="ts">
import {
  defineProps,
  defineEmits,
  ref,
  watchEffect,
  onMounted,
  computed,
  onBeforeUnmount,
  watch,
  unref,
} from "vue";
import {
  AddCircleOutline,
  RemoveCircleOutline,
} from "@vicons/ionicons5";
import throttle from "lodash.throttle";
import {
  Grid,
  Cell,
  Direction,
  nullCell,
  GridStyle,
  CellProba,
} from "grid";
import Layout from "../layouts/Main.vue";
import SVGGrid from "./svg-renderer/Grid.vue";
import GridInput from "./svg-renderer/GridInput.vue";
import { defaultExportOptions, Method, Mode, Ordering } from "../types";
import ModalOptions from "./forms/ModalOptions.vue";
import Autofill from "./sidebars/Autofill.vue";
import GridHighlight from "./svg-renderer/GridHighlight.vue";
import Suggestion from "./sidebars/Suggestion.vue";
import Definition from './sidebars/Definition.vue';
import Buttons from './sidebars/Buttons.vue';
import { workerController } from "../worker";
/**
 * Component to edit a grid
 */
const props = defineProps<{
  /**
   * The grid to edit
   */
  grid: Grid;
  /**
   * The grid style
   */
  style: GridStyle;
}>();
const emit = defineEmits<{
  /**
   * The grid has been updated
   */
  (event: "update"): string;
  /**
   * The grid cols/rows changed
   */
  (event: "size-update"): void;
}>();

const dir = ref<Direction>("horizontal");
const focus = ref<Cell>(nullCell);
const hoveredCell = ref<Cell>(nullCell);
const gridVersion = ref(1);
const container = ref(null as unknown as HTMLDivElement);
const offset = ref<[number, number]>([-10, 0]);
const method = ref<Method>("accurate");
const ordering = ref<Ordering>("best");
const orderings = ref<Ordering[]>(["best", "alpha", "inverse-alpha", "random"]);
const zoom = ref(1);
const highlightModes = ["normal", "check", "heatmap"] as Mode[];
const highlightMode = ref<Mode>(highlightModes[1]);
const cellProbas = ref<CellProba[][]>([]);
const searchResult = ref<string[]>([]);
const refreshingRun = ref(false);
const refreshingSearch = ref(false);

function resetGrid() {
  props.grid.cells.forEach((row) => {
    row.forEach((cell) => {
      if (cell.definition) {
        cell.arrows = ['none', 'none', 'none'];
      }
      // cell.text = '';
    });
  });
  onGridUpdate();
}
function refreshCellProba() {
  refreshingRun.value = true;
  workerController.run(props.grid);
}
function refreshSimpleSearch() {
  refreshingSearch.value = true;
  workerController.search(props.grid, focus.value, dir.value);
}
const throttledRefresCellProba = throttle(refreshCellProba, 200);
const throttledRefresSimpleSearch = throttle(refreshSimpleSearch, 60);
function onGridUpdate() {
  //refresh the children components that need it.
  gridVersion.value = gridVersion.value + 1;
  throttledRefresCellProba();
  emit("update");
}
function computeOffset(e) {
  const topOffset =
    container.value.querySelector(".svg-grid").getBoundingClientRect().top -
    container.value.getBoundingClientRect().top;
  offset.value = [
    (e ? e.target.scrollLeft : 0) - 10,
    (e ? e.target.scrollTop : 0) - topOffset,
  ];
}
function onScroll(e) {
  computeOffset(e);
}
watchEffect(() => {
  props.grid.highlight(props.grid.getBounds(focus.value, dir.value).cells);
});
watch(method, () => {
  if (method.value === "accurate") {
    return throttledRefresCellProba();
  }
  throttledRefresSimpleSearch();
});
onMounted(() => {
  computeOffset(null);
  workerController.checkGrid(props.grid);
  throttledRefresCellProba();
});

onBeforeUnmount(() => { });
function onZoomIn() {
  zoom.value = zoom.value + 0.1;
}
function onZoomOut() {
  zoom.value = Math.max(0.5, zoom.value - 0.1);
}
function onModeClick() {
  const newIndex =
    (highlightModes.findIndex((m) => m === highlightMode.value) + 1) %
    highlightModes.length;
  highlightMode.value = highlightModes[newIndex];
}

function onHover(value: string) {
  const cells = props.grid.getBounds(focus.value, dir.value).cells;
  if (!cells || !cells.length) return;
  props.grid.suggest([value], [cells[0]], [dir.value]);
}
function onMouseOut(value: string) {
  props.grid.suggest([], [], []);
}
function onClick(value: string) {
  const cells = props.grid.getBounds(focus.value, dir.value).cells;
  if (!cells || !cells.length) return;
  props.grid.setWord(value, cells[0], dir.value);
  onGridUpdate();
}
function onKeyUp(evt: KeyboardEvent) {
  if (!evt.ctrlKey) return;
  let consumed = false;
  if (evt.key === "ArrowUp" || evt.key === "ArrowDown") {
    dir.value = "vertical";
    consumed = true;
  }
  if (evt.key === "ArrowLeft" || evt.key === "ArrowRight") {
    dir.value = "horizontal";
    consumed = true;
  }
  // TODO: check how to delegate this to Buttons.vue
  if (evt.key === ">" || evt.key === "<") {
    // ordering.value = ordering.value * -1;
    const ords = unref(orderings);
    ordering.value =
      ords[(ords.findIndex((o) => o === ordering.value) + 1) % ords.length];
    consumed = true;
  }
  if (evt.code === "Space") {
    method.value = method.value = "simple" ? "accurate" : "simple";
    consumed = true;
  }
  // @ts-ignore
  evt.canceled = consumed;
}
watch([focus], () => {
});
workerController.on("run-result", (data) => {
  cellProbas.value = data;
  refreshingRun.value = false;
});
workerController.on("bail-result", () => {
  cellProbas.value = [];
});
workerController.on("search-result", (data) => {
  refreshingSearch.value = false;
  searchResult.value = data;
});

workerController.on("locale-changed", () => {
  throttledRefresCellProba();
  throttledRefresSimpleSearch();
});
workerController.on("start-locale-change", () => {
  refreshingRun.value = true;
  refreshingSearch.value = true;
});

watch([focus, dir], () => {
  throttledRefresSimpleSearch();
});

const isLoadingSuggestions = computed(() => {
  return method.value === "accurate"
    ? refreshingRun.value
    : refreshingSearch.value;
});
</script>

<style>
.container {
  box-sizing: border-box;
  margin-left: 10px;
}

.title {
  display: flex;
  justify-content: space-around;
  width: 100%;
}

.svg-grid {
  padding-right: 20px;
  padding-bottom: 20px;
}

.controls {
  position: fixed;
  bottom: 10px;
  right: 10px;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  gap: 5px;
  width: 100%;
  margin-left: 10px;
  justify-content: flex-end;
  z-index: 100;
  pointer-events: none;
}

.zoom-controls {
  pointer-events: auto;
  background-color: #fff;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 5px;
}

text.highlighted {
  fill: #000;
}

.text.suggested {
  fill: #777;
}

.text.highlighted>rect {
  fill: #def;
}

.superpose {
  display: grid;
}

.superpose>* {
  grid-area: 1 / 1 / 1 / 1;
}
</style>