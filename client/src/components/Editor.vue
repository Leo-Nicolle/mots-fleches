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
        </div>
        <SVGGrid
          @focus="(cell) => (focus = cell)"
          :grid="grid"
          :focus="focus"
          :dir="dir"
          :options="options"
          :zoom="1 / zoom"
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
          @update="emit('update')"
          @keyup="onKeyUp"
        >
        </GridInput>
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
import { Grid, Cell, Direction, nullCell, GridOptions } from "grid";
import Layout from "../layouts/Main.vue";
import SVGGrid from "./svg-renderer/Grid.vue";
import GridInput from "./svg-renderer/GridInput.vue";
import { defaultExportOptions } from "../types";
import ModalOptions from "./forms/ModalOptions.vue";
import Suggestion from "./Suggestion.vue";
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
const version = ref(0);
const container = ref(null as unknown as HTMLDivElement);
const offset = ref<[number, number]>([-10, 0]);
const method = ref<"simple" | "fastest">("fastest");
const ordering = ref<number>(1);
const zoom = ref(1);

function refresh() {
  version.value++;
}
function computeOffset(e) {
  const topOffset =
    container.value.querySelector(".svg-grid").getBoundingClientRect().top -
    container.value.getBoundingClientRect().top;
  console.log(topOffset, container.value.scrollTop);
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
  zoom.value = Math.max(1 ,zoom.value - 0.1);
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
  margin-bottom: 5px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 5px;
  width: 100%;
  margin-left: 10px;
  justify-content: flex-start;
}
</style>