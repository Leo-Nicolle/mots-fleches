<template>
  <div ref="container" class="grid" :version="version">
    <div class="row" v-for="(row, i) in grid.cells" :key="i">
      <div class="cell" v-for="(cell, j) in row" :key="j">
        <input
          v-if="!cell.definition"
          type="text"
          :class="getClass(cell)"
          :value="cell.text.length ? cell.text : cell.suggestion"
          @click="focused = { y: i, x: j }"
          @keyup="onKeyPress"
          @input="onChange($event, i, j)"
        />
        <Definition
          v-else
          class="cell"
          :width="cellWidth"
          :cell="cell"
          @click2="focused = { y: i, x: j }"
        ></Definition>
        <button @click="onClick(i, j)"></button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineEmits, ref, defineProps, watchEffect } from "vue";
import Definition from "./Definition.vue";
import Grid, { nullCell } from "../grid/Grid";
import Vector from "vector2js";
import { Cell, Direction, Vec } from "../grid/types";

const w = ref(56);
const b = ref(8);

const container = ref(null);
const focused = ref<Vec>({ x: -1, y: -1 });
const cellWidth = ref(`${w.value}px`);
const buttonWidth = ref(`${b.value}px`);
const props = defineProps<{ grid: Grid; suggestion: string; dir: Direction }>();
const emit = defineEmits<{
  (event: "type", value: number): void;
  (event: "focus", value: Vec): void;
}>();
let version = ref(0);

watchEffect(() => {
  const cells = props.grid.getBounds(focused.value, props.dir).cells;
  props.grid.highlight(cells);
  if (!container.value) return;
  if (!cells.length) return;
  console.log('focus', cells[0]);
  emit("focus", cells[0]);
  if (props.grid.isDefinition(focused.value)) return;
  const row = [...container.value.querySelectorAll(".row")][focused.value.y];
  if (!row) return;
  const col = [...row.querySelectorAll(".cell")][focused.value.x];
  col.firstChild.focus();
  props.grid.suggest([], [], []);
});

function getClass(cell: Cell) {
  const f = focused.value;
  return [
    cell.highlighted ? "highlight" : null,
    cell.suggestion.length && !cell.text.length ? "suggest" : null,

    Grid.equal(f, cell) ? "focus" : null,
    props.grid.isDefinition(cell) ? "definition" : null,
  ].filter((e) => e);
}
function onClick(y: number, x: number) {
  props.grid.setDefinition({ x, y }, !props.grid.getCell({ x, y }).definition);
  props.grid.highlight(props.grid.getBounds(focused.value, props.dir).cells);
  emit("type");
  refresh();
}

function onChange(evt: InputEvent, y: number, x: number) {
  props.grid.setText({ x, y }, (evt.target as HTMLInputElement).value || "");
  console.log();
  if (props.grid.isDefinition(focused.value)) return;
  emit("type");
  const next = evt.target.value.length
    ? props.grid.increment(focused.value, props.dir)
    : props.grid.decrement(focused.value, props.dir);
  focused.value = { ...next };
}
function onKeyPress(event) {
  const vec = new Vector(0, 0);
  if (event.code == "ArrowUp") {
    vec.y -= 1;
  } else if (event.code == "ArrowDown") {
    vec.y += 1;
  } else if (event.code == "ArrowLeft") {
    vec.x -= 1;
  } else if (event.code == "ArrowRight") {
    vec.x += 1;
  }
  if (!vec.x && !vec.y) return;
  const f = vec.addSelf(focused.value);
  if (!props.grid.isValid(f)) return;
  focused.value = { ...f };
}
function refresh() {
  version.value++;
}
</script>

<style scoped>
.row {
  display: flex;
  flex-direction: row;
}
.grid {
  display: flex;
  flex-direction: column;
}
.cell {
  width: v-bind(cellWidth);
  height: v-bind(cellWidth);
  border: 1px solid black;
  cursor: text;
}
.cell > input {
  display: flex;
  align-items: center;
  width: v-bind(cellWidth);
  height: v-bind(cellWidth);
  padding: 0;
  outline: 0;
  text-align: center;
  font-size: v-bind(cellWidth);
  text-transform: capitalize;
  justify-content: space-around;
  border: 0;
}
.cell > button {
  position: relative;
  cursor: pointer;
  min-width: v-bind(buttonWidth);
  min-height: v-bind(buttonWidth);
  max-width: v-bind(buttonWidth);
  max-height: v-bind(buttonWidth);
  border-radius: 50%;
  padding: 0;
  transform: translate(
    calc(v-bind(cellWidth) - v-bind(buttonWidth) * 0.75),
    calc(v-bind(buttonWidth) * -2)
  );
}
.cell:hover {
  background: #eee;
}
.cell > .highlight.focus {
  background: #acf;
}
.highlight {
  background: #def;
}
.suggest {
  color: #777;
}
.cell > input.definition {
  background: #aaa;
  font-size: calc(v-bind(cellWidth) * 0.25);
}
</style>