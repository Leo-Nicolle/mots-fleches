<template>
  <div class="grid-input" ref="container">
    <textarea
      @input="onChange($event)"
      @keyup="onKeyup($event)"
      :value="
        cell.text.length
          ? cell.text
          : cell.suggestion.length
          ? cell.suggestion
          : ''
      "
      :rows="cell.definition ? 5 : 1"
      :class="getCellClass(cell, cell)"
    />
    <div class="handles" v-if="cell.definition">
      <n-popover v-for="(handle, k) in handles" :key="k" trigger="hover">
        <template #trigger>
          <n-button
            class="handle"
            :style="{
              top: handle.top,
              left: handle.left,
            }"
          ></n-button>
        </template>
        <n-button
          icon-placement="right"
          v-for="(dir, l) in handle.dirs"
          @click="setArrow(dir, handle.index)"
          :key="l"
        >
          <template #icon>
            <svg
              viewBox="0 -35 110 150"
              fill="none"
              stroke="black"
              stroke-width="10"
              stroke-linecap="round"
              xmlns="http://www.w3.org/2000/svg"
            >
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
  GridOptions,
  nullCell,
  isSplited,
  parse,
  ArrowDir,
  outerBorderWidth,
} from "grid";
import { getCellClass } from "../../js/utils";
import { getD } from "../../js/paths";
import { Handle } from "./types";
const container = ref(null as unknown as HTMLDivElement);
const emit = defineEmits<{
  (event: "update"): string;
  (event: "focus", value: Cell);
}>();
const props = defineProps<{
  cell: Cell;
  grid: Grid;
  options: GridOptions;
  dir: Direction;
  offset: [number, number];
}>();
const cellSize = computed(() => `${cellWidth(props.options)}px`);
const textSize = computed(() => parse(props.options.grid.cellSize)[0]);
const textFont = computed(() => `${textSize.value}px roboto`);
const defSize = computed(() => parse(props.options.definition.size)[0]);
const defFont = computed(
  () => `${defSize.value}px ${props.options.definition.font}`
);
const transform = computed(() => {
  return `translate(${
    props.cell.x * cellAndBorderWidth(props.options) +
    outerBorderWidth(props.options)- props.offset[0]
  }px, ${
    props.cell.y * cellAndBorderWidth(props.options) +
    outerBorderWidth(props.options) - props.offset[1]
  }px)`;
});
function onChange(evt: Event) {
  const { x, y } = props.cell;
  let text = (evt.target as HTMLInputElement).value || "";
  if (!props.cell.definition) {
    text = text.trim().slice(-1).toUpperCase();
  }
  props.grid.setText({ x, y }, text);
  emit("update");
  if (props.grid.isDefinition(props.cell)) {
    if (!isSplited(props.cell)) {
      Grid.setArrow(props.cell, 1, "none");
    }
    return;
  }
  const next = text.length
    ? props.grid.increment(props.cell, props.dir)
    : props.grid.decrement(props.cell, props.dir);
  if (!props.grid.isValid(next) || next.definition) return;
  emit("focus", next);
}
function onKeyup(evt: KeyboardEvent) {
  if (evt.key === "Escape") {
    props.grid.setDefinition(props.cell, !props.cell.definition);
    props.grid.setText(props.cell, "");
    emit("update");
    return;
  }
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
function setArrow(dir: ArrowDir, index: number) {
  Grid.setArrow(props.cell, index, dir);
  container.value.querySelector("textarea")?.focus();
  emit("update");

}
const handleW = 4;
const handles = computed<Handle[]>(() => {
  const splited = isSplited(props.cell);
  const w = cellAndBorderWidth(props.options);
  return splited
    ? [
        {
          top: `${0.25 * w - handleW}px`,
          left: `${w}px`,
          index: 0,
          dirs: ["right", "rightdown", "none"],
        },
        {
          top: `${0.75 * w - handleW}px`,
          left: `${w}px`,
          index: 1,
          dirs: ["right", "rightdown", "none"],
        },
        {
          top: `${w}px`,
          left: `${0.5 * w - handleW}px`,
          index: 2,
          dirs: ["down", "downright", "none"],
        },
      ]
    : [
        {
          top: `${0.5 * w - handleW}px`,
          left: `${w}px`,
          index: 0,
          dirs: ["right", "rightdown", "none"],
        },
        {
          top: `${w}px`,
          left: `${0.5 * w - handleW}px`,
          index: 2,
          dirs: ["down", "downright", "none"],
        },
      ];
});

watchEffect(() => {
  if (props.cell === nullCell || !container.value) return;
  container.value.querySelector("textarea")?.focus();
});
</script>

<style scoped>
.grid-input {
  position: absolute;
  top: 0;
  left: 0;
  padding: 0;
  margin: 0;
  transform: v-bind(transform);
}
textarea {
  overflow: hidden;
  resize: none;
  padding: 0;
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
  line-height: v-bind(defSize);
  font-size: v-bind(defSize);
  font: v-bind(defFont);
  background: #aaa;
}

.handle {
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