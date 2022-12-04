<template>
  <div ref="container" class="grid" :version="version">
    <div class="row" v-for="(row, i) in grid.cells" :key="i">
      <div class="cell" v-for="(cell, j) in row" :key="j">
        <input
          type="text"
          :class="getClass(cell)"
          :value="cell.suggestion.length ? cell.suggestion : cell.text"
          @click="focus(i, j)"
          @keyup="onKeyPress"
          @input="onChange($event, i, j)"
        />
        <button @click="onClick(i, j)"></button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineEmits, ref, defineProps } from "vue";
import Grid, { nullCell } from "../grid/Grid";
import Vector from "vector2js";
import { Cell, Direction, Vec } from "../grid/types";

const container = ref(null);
let focused = ref(nullCell);
const cellWidth = ref(`${52}px`);
const buttonWidth = ref(`${15}px`);
const props = defineProps<{ grid: Grid; suggestion: string }>();
const emit = defineEmits<{
  (event: "type", value: number): void;
  (event: "focus", value: Vec): void;
}>();
let dir: Direction = "horizontal";
let version = ref(0);
// const grid: Grid = new Grid(10,10);
function focus(i: number, j: number) {
  focused.value = props.grid.cells[i][j];
  const cells = props.grid.getBounds(focused.value, dir).cells;
  props.grid.highlight(cells);
  const row = [...container.value.querySelectorAll(".row")][focused.value.y];
  const col = [...row.querySelectorAll(".cell")][focused.value.x];
  col.firstChild.focus();
  props.grid.suggest([], [], []);
  emit("focus", cells[0]);
}
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
  props.grid.highlight(props.grid.getBounds(focused.value, dir).cells);
  emit("type");
  refresh();
}

function onChange(evt: InputEvent, y: number, x: number) {
  props.grid.setText({ x, y }, (evt.target as HTMLInputElement).value || "");
  emit("type");
  if (focused.value.definition) return;
  const next = props.grid.increment(focused.value, dir);
  if (next.definition || !props.grid.isValid(next)) {
    return refresh();
  }
  focus(next.y, next.x);
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
  focus(f.y, f.x);
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
    calc(v-bind(buttonWidth) * -0.75)
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
.definition {
  background: #aaa;
  font-size: calc(v-bind(cellWidth) * 0.25);
}
</style>