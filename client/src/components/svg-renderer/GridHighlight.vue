<template>
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
    </span>
  </span>
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
/**
 * Button to add words from the grid to the dictionnary
 */

const props = defineProps<{
  /**
   * The grid to edit
   */
  cell: Cell;
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
const transform = ref("");
const hovered = ref(false);
const width = ref<string | number>(0);
const height = ref<string | number>(0);
const visible = computed(() => {
  return !Grid.equal(props.cell, nullCell) && !props.cell.definition;
});
const tooltip = ref<string>("");
watchEffect(() => {
  if (hovered.value) return;
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
</style>