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

        <div
          v-else
          class="def"
          :width="cellWidth"
          :class="getClass(cell)"
          @click="focused = { y: i, x: j }"
        >
          <textarea></textarea>
          <n-popover
            v-for="(p, k) in points[+cell.splited]"
            :key="k"
            trigger="hover"
          >
            <template #trigger>
              <n-button
                class="handle"
                :style="{
                  gridColumnStart: getCol(p),
                  gridRowStart: getRow(p),
                }"
              ></n-button>
            </template>
            <n-button
              icon-placement="right"
              v-for="(dir, l) in getDir(p.x)"
              @click="setArrow({ x: j, y: i }, p, dir)"
              :key="l"
            >
              <template #icon>
                <n-icon>
                  <Arrow :dir="dir" />
                </n-icon>
              </template>
            </n-button>
          </n-popover>
          <n-icon
            class="arrow"
            v-for="(a, k) in cell.arrows"
            :key="k"
            :style="{
              gridColumnStart: getCol(a.position),
              gridRowStart: getRow(a.position),
            }"
          >
            <Arrow :dir="a.direction" />
          </n-icon>
        </div>
        <button @click="onClick(i, j)"></button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineEmits, ref, defineProps, watchEffect } from "vue";
import Arrow from "./Arrow";
import Grid, { nullCell } from "../grid/Grid";
import Vector from "vector2js";
import { ArrowDir, Cell, Direction, Vec } from "../grid/types";

const w = ref(56);
const b = ref(8);
const definition = ref(null);
const version = ref(1);
const points = [
  [
    { x: 1, y: 0.5, row: 3, col: 3 },
    { x: 0.5, y: 1, row: 6, col: 2 },
  ],
  [
    { x: 1, y: 0.25, row: 2, col: 3 },
    { x: 1, y: 0.75, row: 4, col: 3 },
    { x: 0.5, y: 1, row: 6, col: 2 },
  ],
];

const container = ref(null);
const focused = ref<Vec>({ x: -1, y: -1 });
const cellWidth = ref(`${w.value}px`);
const buttonWidth = ref(`${b.value}px`);
const props = defineProps<{ grid: Grid; suggestion: string; dir: Direction }>();
const emit = defineEmits<{
  (event: "type", value: number): void;
  (event: "focus", value: Vec): void;
}>();

watchEffect(() => {
  const cells = props.grid.getBounds(focused.value, props.dir).cells;
  props.grid.highlight(cells);
  if (!container.value) return;
  if (!cells.length) return;
  console.log("focus", cells[0]);
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
function getTransform(p) {
  if (!definition.value) return `translate(0, 0)`;
  const { x, y, width, height } = definition.value
    .querySelector(".def")
    .getBoundingClientRect();
  console.log(p, width, height);
  const res = new Vector(p.x, p.y).mul({ x: width, y: height });
  return `translate(${res.x}px, ${res.y}px)`;
}
function getHanldePosition(p: Vec, o = 0) {
  if (!definition.value) return { x: 0, y: 0 };
  const { x, y, width, height } = definition.value
    .querySelector(".def")
    .getBoundingClientRect();
  console.log(p, width, height);
  return new Vector(p.x, p.y).mul({ x: width, y: height });
}

function getRow(point: Vec) {
  return point.y == 0.25 ? 2 : point.y === 0.5 ? 3 : point.y === 0.75 ? 4 : 6;
}
function getCol(point: Vec) {
  return point.x == 0.5 ? 2 : 3;
}
function getDir(x: number): ArrowDir[] {
  // if (props.grid.isSplited(focused)) {
    return x > 0.75
      ? ["none", "right", "rightdown"]
      : ["none", "down", "downright"];
  // }
  // return i < 1 ? ["none", "right", "rightdown"] : ["none", "down", "downright"];
}
function setArrow(v: Vec, p: Vec, direction: ArrowDir) {
  props.grid.setArrow(v, p, direction);
  refresh();
}
function onSplit() {
  Grid.setSplit(
    props.grid.isSplited(focused),
    !props.grid.isSplited(focused).splited
  );
  refresh();
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
.separator {
  position: relative;
  top: 50%;
  widows: 100%;
  background: black;
  height: 1px;
}
.def {
  border: 0;
  display: grid;
  width: v-bind(cellWidth);
  height: v-bind(cellWidth);
  grid-template-rows: 25% 25% 25% 25%;
  grid-template-columns: 50% 50%;
  gap: 0px 0px;
  grid-auto-flow: row;
}
textarea {
  border: 0;
  outline: 0;
  padding: 0;
  margin: 0;
  text-align: center;
  text-anchor: start;
  max-width: 100%;
  height: 100%;
  resize: none;
  background: #aaa;
  line-height: calc(v-bind(cellWidth) / 4 - 1px);
  text-overflow: clip;
  overflow-wrap: anywhere;
  overflow: hidden;
  grid-area: 1 / 1 / 5 / 3;
}
textarea:focus {
  outline: 0;
  border: 0;
}
.arrow {
  height: 2em;
  width: 2em;
}
.handle {
  position: relative;
  cursor: pointer;
  padding: 4px;
  height: 0;
  width: 0;
  border: 0;
  border-radius: 50%;
  z-index: 100;
  background: #333;
  transform: translate(-50%, -50%);
}
.n-icon svg {
  width: 100%;
  height: 100%;
}
.n-icon-slot i {
  transform: translate(50%, 45%);
}
img {
  width: 100%;
}
</style>