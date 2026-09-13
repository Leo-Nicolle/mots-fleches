<template>
  <div class="arrow-handles">
    <div class="handles" v-if="cell.definition">
      <n-popover v-for="(handle, k) in handles" :key="k" trigger="hover">
        <template #trigger>
          <n-button class="handle" :style="{
            top: handle.top,
            left: handle.left,
          }"></n-button>
        </template>
        <n-button icon-placement="right" v-for="(dir, l) in handle.dirs" @click="setArrow(dir, handle.index)" :key="l">
          <template #icon>
            <svg viewBox="0 -35 110 150" fill="none" stroke="black" stroke-width="10" stroke-linecap="round"
              xmlns="http://www.w3.org/2000/svg">
              <path :class="dir" :d="getD(dir)"></path>
            </svg>
          </template>
        </n-button>
      </n-popover>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  ArrowDir,
  Cell,
  Grid,
  GridStyle,
  arrowPositions,
  cellAndBorderWidth,
} from "grid";
import { getD } from "../../js/paths";
import { Handle } from "../../types";
import { useTransform } from "./utils";

const emit = defineEmits<{
  (event: "update"): void;
}>();
const props = defineProps<{
  /**
   * The definition cell to place arrows on
   */
  cell: Cell;
  /**
   * The style of the grid
   */
  style: GridStyle;
  /**
   * Scrolling offset
   */
  offset: [number, number];
  /**
   * Zoom level
   */
  zoom: number;
}>();

const transform = computed(() => useTransform(props, props.cell));

/**
 * Updates the arrows of the cell
 */
function setArrow(dir: ArrowDir, index: number) {
  Grid.setArrow(props.cell, index, dir);
  emit("update");
}
const handleW = 6;
/**
 * Computes the position of the dots to add arrows
 */
const handles = computed<Handle[]>(() => {
  const w = cellAndBorderWidth(props.style) * props.zoom;
  return arrowPositions(props.cell)
    .filter(({ y }) => y > 0)
    .map(({ x, y }, i) => {
      return {
        top: `${y * w - handleW}px`,
        left: `${x * w - handleW}px`,
        index: x === 1 ? i : 2,
        dirs:
          x === 1
            ? ["right", "rightdown", "none"]
            : ["down", "downright", "none"],
      };
    });
});
</script>

<style scoped>
.arrow-handles {
  top: 0;
  left: 0;
  padding: 0;
  margin: 0;
  pointer-events: none;
  transform: v-bind(transform);
}

.handle {
  pointer-events: initial;
  position: absolute;
  cursor: pointer;
  padding: 7px;
  height: 0;
  width: 0;
  border: 0;
  border-radius: 50%;
  z-index: 100;
  background: #333;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.9);
}

.rightdown {
  transform: rotate(180deg) scale(-1, -1);
}

.right {
  transform: translate(0, 30px) rotate(180deg) scale(-1, -1);
}

.downright {
  transform: translate(8px, 0) scale(-1, 1) rotate(90deg);
}

.down {
  transform: translate(50px, 0) scale(-1, 1) rotate(90deg);
}

.none {
  transform: translate(10px, 0);
}
</style>
