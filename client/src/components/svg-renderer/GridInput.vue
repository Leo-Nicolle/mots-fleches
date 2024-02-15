<template>
  <div class="grid-input" ref="container">
    <textarea @input="onChange($event)" @focusout="onLooseFocus($event)" @keyup="onKeyup($event)"
      @keydown="onKeydown($event)" :value="cell.text.length
        ? cell.text
        : cell.suggestion.length
          ? cell.suggestion
          : ''
        " :rows="cell.definition ? 5 : 1" :class="getCellClass(cell, cell)" />
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
import { computed, defineEmits, defineProps, ref, watchEffect } from "vue";
import {
  Cell,
  Grid,
  cellAndBorderWidth,
  cellWidth,
  Direction,
  GridStyle,
  nullCell,
  isSplited,
  parse,
  ArrowDir,
  outerBorderWidth,
  arrowPositions,
} from "grid";
import { getCellClass } from "../../js/utils";
import { getD } from "../../js/paths";
import { Handle } from "../../types";
import { useSvgSizes, useTransform } from "./utils";
/**
 * Component to type text on the grid
 */
const container = ref(null as unknown as HTMLDivElement);
const emit = defineEmits<{
  /**
   * The grid is updated
   */
  (event: "update"): string;
  /**
   * Keyup event
   */
  (event: "keyup", value: KeyboardEvent): void;
  /**
   * A cell is focused
   */
  (event: "focus", value: Cell): void;
}>();
const props = defineProps<{
  /**
   * The cell to type on
   */
  cell: Cell;
  /**
   * The grid
   */
  grid: Grid;
  /**
   * The style of the grid
   */
  style: GridStyle;
  /**
   * Typing direction
   */
  dir: Direction;
  /**
   * Scrolling offset
   */
  offset: [number, number];
  /**
   * Zoom level
   */
  zoom: number;
}>();
const { cellSize, textSize, textFont, defSize, defSizePx, defFont } = useSvgSizes(props);
const defSizeZoom = computed(() => `${defSize.value * props.zoom}px`);
const defBackgroundColor = computed(
  () => props.style.definition.backgroundColor
);
const transform = computed(() => useTransform(props, props.cell));
function onChange(evt: Event) {
  const { x, y } = props.cell;
  let text = (evt.target as HTMLInputElement).value || "";
  if (text.includes("_") || text.includes("|")) {
    text = text.replace("_", "").replace("|", "");
    (evt.target as HTMLInputElement).value = props.cell.text;
    return;
  }
  if (!props.cell.definition) {
    text = text.trim().slice(-1).toUpperCase();
  }
  props.grid.setText({ x, y }, text);
  emit("update");
  if (props.grid.isDefinition(props.cell)) {
    return;
  }
  const next = text.length
    ? props.grid.increment(props.cell, props.dir)
    : props.grid.decrement(props.cell, props.dir);
  if (!props.grid.isValid(next) || next.definition) return;
  emit("focus", next);
}
let shouldGoBackwards = false;
function onKeydown(evt: KeyboardEvent) {
  let text = (evt.target as HTMLInputElement).value || "";
  if (props.cell.definition || text.length || evt.code !== "Backspace") return;
  // go backwards on backspace keydown if the cell is empty
  shouldGoBackwards = true;
}
function onKeyup(evt: KeyboardEvent) {
  // | and _ are used to toggle spaceH and spaceV
  if (evt.key === "|") {
    props.grid.setSpaceH(props.cell, !props.cell.spaceH);
    emit("update");
    return;
  }
  if (evt.key === "_") {
    props.grid.setSpaceV(props.cell, !props.cell.spaceV);
    emit("update");
    return;
  }
  // The editor migt use the event, if so, it sets canceled to true
  // and we ignore it
  emit("keyup", evt);
  // @ts-ignore
  if (evt.canceled) return;
  // escape to toggle definition
  if (evt.key === "Escape") {
    props.grid.setDefinition(props.cell, !props.cell.definition);
    props.grid.setText(props.cell, "");
    emit("update");
    return;
  }
  if (shouldGoBackwards) {
    shouldGoBackwards = false;
    const next = props.grid.decrement(props.cell, props.dir);
    if (!props.grid.isValid(next)) return;
    emit("focus", next);
    return;
  }
  // ctrl + enter to moveout from definition
  if (props.cell.definition && evt.key === "Enter" && evt.ctrlKey) {
    let next = props.grid.increment(props.cell, props.dir);
    if (!props.grid.isValid(next)) {
      next = props.grid.decrement(props.cell, props.dir);
    }
    if (!props.grid.isValid(next)) {
      next = props.grid.increment(props.cell, Grid.perpendicular(props.dir));
    }
    if (!props.grid.isValid(next)) {
      next = props.grid.decrement(props.cell, Grid.perpendicular(props.dir));
    }
    return emit("focus", next);
  }
  // arrows to move around in the grid
  if (!props.cell.definition) {
    if (evt.key === "ArrowUp") {
      const next = props.grid.decrement(props.cell, "vertical");
      if (props.grid.isValid(next)) {
        return emit("focus", next);
      }
    }
    if (evt.key === "ArrowDown") {
      const next = props.grid.increment(props.cell, "vertical");
      if (props.grid.isValid(next)) {
        return emit("focus", next);
      }
    }
    if (evt.key === "ArrowLeft") {
      const next = props.grid.decrement(props.cell, "horizontal");
      if (props.grid.isValid(next)) {
        return emit("focus", next);
      }
    }
    if (evt.key === "ArrowRight") {
      const next = props.grid.increment(props.cell, "horizontal");
      if (props.grid.isValid(next)) {
        return emit("focus", next);
      }
    }
  }
}
/**
 * Updates the arrows of the cell
 */
function setArrow(dir: ArrowDir, index: number) {
  Grid.setArrow(props.cell, index, dir);
  container.value.querySelector("textarea")?.focus();
  emit("update");
}
const handleW = 4;
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
function onLooseFocus(evt: FocusEvent) {
  if (Grid.equal(props.cell, nullCell)) return;
  evt.target.focus();
}

watchEffect(() => {
  if (props.cell === nullCell || !container.value) return;
  container.value.querySelector("textarea")?.focus();
});
</script>

<style scoped>
.grid-input {
  top: 0;
  left: 0;
  padding: 0;
  margin: 0;
  pointer-events: none;
  transform: v-bind(transform);
}

.definition {
  font: v-bind(defFont);
}

textarea {
  overflow: hidden;
  resize: none;
  padding: 0;
  margin: 0;
  width: v-bind(cellSize);
  height: v-bind(cellSize);
  text-align: center;
  outline: none;
  border: 0;
}

textarea:focus {
  overflow: hidden;
  resize: none;
  border: none;
}

textarea:focus-visible {
  overflow: hidden;
  resize: none;
  border: none;
}

.text {
  font: v-bind(textFont);
  background: #acf;
}

.text.suggested {
  color: #777;
}

.definition {
  font: v - bind(defFont);
  line-height: v-bind(defSizePx);
  background-color: v-bind(defBackgroundColor);
  text-wrap: nowrap;
  background: #aaa;
}

.handle {
  pointer-events: initial;
  position: absolute;
  cursor: pointer;
  padding: 4px;
  height: 0;
  width: 0;
  border: 0;
  border-radius: 50%;
  z-index: 100;
  background: #333;
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