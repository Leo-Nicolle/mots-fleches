<template>
  <div class="grid-input" ref="container">
    <textarea
      @input="onChange($event)"
      @keyup="onKeyup($event)"
      :value="cell.text.length ? cell.text : ''"
      :class="cell.definition ? 'def-input' : 'text-input'"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, defineEmits, defineProps, ref, watchEffect } from "vue";
import {
  Cell,
  cellAndBorderWidth,
  cellWidth,
  Direction,
  Grid,
  GridOptions,
  nullCell,
  parse,
} from "grid";
const container = ref(null as unknown as HTMLDivElement);
const emit = defineEmits<{
  (event: "update", value: string): string;
  (event: "focus", value: Cell);
}>();
const props = defineProps<{
  cell: Cell;
  grid: Grid;
  options: GridOptions;
  dir: Direction;
}>();
const cellSize = computed(() => `${cellWidth(props.options)}px`);
const textSize = computed(() => parse(props.options.grid.cellSize)[0]);
const textFont = computed(() => `${textSize.value}px roboto`);
const defSize = computed(() => parse(props.options.definition.size)[0]);
const defFont = computed(
  () => `${defSize.value}px ${props.options.definition.font}`
);
const transform = computed(() => {
  return `translate(${props.cell.x * cellAndBorderWidth(props.options)}px, ${
    props.cell.y * cellAndBorderWidth(props.options)
  }px)`;
});
function onChange(evt: Event) {
  // emit("update", target.value);
  const { x, y } = props.cell;
  let text = (evt.target as HTMLInputElement).value || "";
  console.log(`'${text}'`);
  if (!props.cell.definition) {
    text = text.trim().slice(-1).toUpperCase();
  }
  props.grid.setText({ x, y }, text);
  if (props.grid.isDefinition(props.cell)) return;
  const next = text.length
    ? props.grid.increment(props.cell, props.dir)
    : props.grid.decrement(props.cell, props.dir);
  if (!props.grid.isValid(next) || next.definition) return;
  emit("focus", next);
}
function onKeyup(evt: KeyboardEvent) {
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
    if(evt.key === "ArrowDown") {
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
function onDefChange(e: Event) {
  const target = e.target as HTMLInputElement;
  emit("update", target.value);
}

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
  width: v-bind(cellSize);
  height: v-bind(cellSize);
  padding: 0;
  margin: 0;
  transform: v-bind(transform);
  overflow: hidden;
}
textarea {
  overflow: hidden;
  resize: none;
  border: none;
  height: 100%;
  width: 100%;
  text-align: center;
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
.text-input {
  font: v-bind(textFont);
  background: #acf;
}
.def-input {
  line-height: v-bind(defSize);
  font-size: v-bind(defSize);
  font: v-bind(defFont);
  background: #aaa;

}
</style>