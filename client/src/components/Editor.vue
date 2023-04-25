<template>
  <Layout @scroll="onScroll">
    <template #left-panel>
      <span class="title">
        <h2>
          {{ grid.title ? grid.title : $t("buttons.newGrid") }}
        </h2>
        <ModalOptions
          :modelValue="grid"
          @update-size="emit('size-update')"
          @update:model-value="emit('update')"
          @open="focus = nullCell"
        />
      </span>
      <Suggestion
        v-if="!focus.definition"
        :point="focus"
        :dir="dir"
        :query="''"
        :grid-id="grid.id"
        :method="method"
        :ordering="ordering"
        @hover="onHover"
        @click="onClick"
        @dir="(d) => (dir = d)"
        @mouseout="onMouseOut"
        @methodswitch="method = method === 'simple' ? 'fastest' : 'simple'"
        @orderswitch="ordering = ordering === 1 ? -1 : 1"
      >
      </Suggestion>
    </template>
    <template #body>
      <div class="container" ref="container">
        <div class="controls">
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
          <n-button @click="onCheck" round> Check </n-button>
        </div>
        <SVGGrid
          @focus="(cell) => (focus = cell)"
          @hover="(cell) => (hoveredCell = cell)"
          :grid="grid"
          :focus="focus"
          :dir="dir"
          :options="options"
          :zoom="1 / zoom"
          :highlights="highlights"
          class="svg-grid"
          :export-options="{
            ...defaultExportOptions,
            texts: true,
            highlight: true,
          }"
        ></SVGGrid>
        <GridInput
          :grid="grid"
          :dir="dir"
          :options="options"
          :cell="focus"
          :offset="offset"
          :zoom="zoom"
          @focus="(point) => (focus = point)"
          @update="emit('update'); refresh();"
          @keyup="onKeyUp"
        >
        </GridInput>
        <GridHighlight
          :grid="grid"
          :options="options"
          :cell="hoveredCell"
          :validity="validity"
          :zoom="zoom"
          :offset="offset"
          :dir="dir"
          @update="emit('update'); refresh();"
        />
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
} from "vue";
import { AddCircleOutline, RemoveCircleOutline } from "@vicons/ionicons5";
import {
  Grid,
  Cell,
  Direction,
  nullCell,
  GridOptions,
  GridValidity,
} from "grid";
import Layout from "../layouts/Main.vue";
import SVGGrid from "./svg-renderer/Grid.vue";
import GridInput from "./svg-renderer/GridInput.vue";
import { defaultExportOptions } from "../types";
import ModalOptions from "./forms/ModalOptions.vue";
import GridHighlight from "./svg-renderer/GridHighlight.vue";
import Suggestion from "./Suggestion.vue";
import { getUrl } from "../js/utils";
import axios from "axios";
import { Bounds } from "grid";
/**
 * Component to edit a grid
 */
const props = defineProps<{
  /**
   * The grid to edit
   */
  grid: Grid;
  /**
   * The grid options
   */
  options: GridOptions;
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
const validity = ref<GridValidity>();
const version = ref(1);
const container = ref(null as unknown as HTMLDivElement);
const offset = ref<[number, number]>([-10, 0]);
const method = ref<"simple" | "fastest">("fastest");
const ordering = ref<number>(1);
const zoom = ref(1);
const highlights = ref(new Map());

function refresh() {
  version.value++;
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
onMounted(() => {
  computeOffset(null);
});
function onZoomIn() {
  zoom.value = zoom.value + 0.1;
}
function onZoomOut() {
  zoom.value = Math.max(1, zoom.value - 0.1);
}
function onCheck() {
  axios
    .get(getUrl(`word-check/${props.grid.id}`))
    .then(({ data }) => {
      console.log(data);
    })
    .catch((e) => {
      console.log(e);
    });
}

function onHover(value: string) {
  const cells = props.grid.getBounds(focus.value, dir.value).cells;
  if (!cells || !cells.length) return;
  props.grid.suggest([value], [cells[0]], [dir.value]);
  refresh();
}
function onMouseOut(value: string) {
  props.grid.suggest([], [], []);
  refresh();
}
function onClick(value: string) {
  const cells = props.grid.getBounds(focus.value, dir.value).cells;
  if (!cells || !cells.length) return;
  props.grid.setWord(value, cells[0], dir.value);
  emit("update");
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
  if (evt.key === ">" || evt.key === "<") {
    ordering.value = ordering.value * -1;
    consumed = true;
  }
  if (evt.code === "Space") {
    method.value = method.value === "simple" ? "fastest" : "simple";
    consumed = true;
  }
  // @ts-ignore
  evt.canceled = consumed;
}
watchEffect(async () => {
  if (!props.grid || !dir.value || !version.value) return;
  const gridValidity = await axios
    .get(getUrl(`word-check/${props.grid.id}`))
    .then(({ data }) => data as GridValidity);
  validity.value = gridValidity;
  const newMap = new Map();
  Object.values(gridValidity[dir.value]).forEach(({ cells, problem }) => {
    cells.forEach(({ x, y }) => newMap.set(`${y}-${x}`, problem));
  });
  highlights.value = newMap;
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
}
.controls > * {
  background: #fff;
}

.unknown {
  fill: rgba(0, 0, 255, 0.2);
}
.incomplete {
  fill: rgba(255, 0, 0, 0.5);
}
text.highlighted {
  fill: #000;
}
.text.suggested {
  fill: #777;
}
.text.highlighted > rect {
  fill: #def;
}
</style>