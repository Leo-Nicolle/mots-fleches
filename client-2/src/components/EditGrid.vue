<template>
  <div
    ref="container"
    class="grid"
    :version="version"
    @mousemove="onDragging($event)"
    @mouseup="onDragEnd()"
  >
    <div class="row" v-for="(row, i) in grid.cells" :key="i">
      <div
        class="cell"
        v-for="(cell, j) in row"
        :key="j"
        :style="{
          cursor: !!draggingCell ? 'pointer!important' : 'unset',
        }"
      >
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
          <textarea
          @input="onChange($event, i, j)"
          :value="cell.text.length ? cell.text: '' "
          ></textarea>
          <div
            class="separator"
            @mousedown="onDragStart(i, j)"
            :style="{
              gridRowStart: +Math.max(1, cell.splited * 2 - 1),
              gridColumnStart: 1,
              gridColumnEnd: 3,
            }"
          ></div>
          <n-popover
            v-for="(p, k) in points[
              Math.min(1, Math.max(+cell.splited - 1, 0))
            ]"
            :key="k"
            trigger="hover"
          >
            <template #trigger>
              <n-button
                class="handle"
                :style="{
                  gridColumnStart: getCol(p),
                  gridRowStart: getRow(p, cell.splited),
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
              gridRowStart: getRow(a.position, cell.splited),
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
    { x: 1, y: 0.5 },
    { x: 0.5, y: 1 },
  ],
  [
    { x: 1, y: 0.25 },
    { x: 1, y: 0.75 },
    { x: 0.5, y: 1 },
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
let cellDiv: HTMLDivElement | null = null;
const draggingCell = ref<Cell | null>(null);

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

function getRow(point: Vec, splited: number) {
  if (point.y === 1) return 9;
  if (splited <= 1){
    return 5;
  }
  if (splited === 2) {
    return point.y == 0.25 ? 2 : 6;
  }
  if (splited === 3) {
    return point.y == 0.25 ? 3 : 7;
  }
  if (splited === 4){
    return point.y == 0.25 ? 4 : 8;
  }
  return 0;
}
function getCol(point: Vec) {
  return point.x == 0.5 ? 2 : 3;
}
function getDir(x: number): ArrowDir[] {
  return x > 0.75
    ? ["none", "right", "rightdown"]
    : ["none", "down", "downright"];
}
function setArrow(v: Vec, p: Vec, direction: ArrowDir) {
  props.grid.setArrow(v, p, direction);
  refresh();
}

function onDragStart(y: number, x: number) {
  const row = [...container.value.querySelectorAll(".row")][y];
  if (!row) return;
  cellDiv = [...row.querySelectorAll(".cell")][x];
  draggingCell.value = props.grid.cells[y][x];
}
function onDragEnd() {
  cellDiv = null;
  draggingCell.value = null;
  emit('type');
}
function onDragging(evt: MouseEvent) {
  if (!draggingCell.value || !cellDiv) return;
  const bb = cellDiv.getBoundingClientRect();
  const row = Math.min(
    4,
    Math.max(1, Math.min(5, Math.round((4 * (evt.clientY - bb.y)) / bb.height)))
  );
  Grid.setSplit(draggingCell.value, row);
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
  emit("type");
  if (props.grid.isDefinition(focused.value)) return;
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
  display: grid;
  grid-template-rows: 0 50%;
  grid-template-columns: 25% 25% 50%;
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
  grid-row-start: 2;
  grid-column-start: 1;
  transform: translate(-50%, -50%);
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
  cursor: pointer;
  padding-top: 10px;
  border-bottom: 1px solid black;
  transform: translate(0, -100%);
}
.separator:hover {
  border-bottom: 3px solid #333;
}
.def {
  position: absolute;
  border: 0;
  display: grid;
  width: v-bind(cellWidth);
  height: v-bind(cellWidth);
  grid-template-rows: 12.5% 12.5% 12.5% 12.5% 12.5% 12.5% 12.5% 12.5%;
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
  font-size: 10px;
  line-height: calc(v-bind(cellWidth) / 4);
  text-overflow: clip;
  overflow-wrap: anywhere;
  overflow: hidden;
  grid-area: 1 / 1 / 9 / 3;
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