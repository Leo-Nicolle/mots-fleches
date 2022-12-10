<template>
  <div ref="definition" class="definition" :version="version">
    Definition
    <n-button icon-placement="right" @click="onSplit">
      {{ cell.splited ? "unsplit" : "split" }}
    </n-button>
    <div
      :style="{
        width: '64px',
        height: '64px',
      }"
    >
      <div class="def">
        <div class="definputs" @click="onFocus">
          <span />
          <span v-if="cell.splited" />
        </div>
        <div v-if="cell.splited" class="separator"></div>

        <n-popover
          v-for="(p, i) in points[+cell.splited]"
          :key="i"
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
            v-for="(dir, j) in getDir(i)"
            @click="setArrow(p, dir)"
            :key="j"
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
          v-for="(a, i) in cell.arrows"
          :key="i"
          :style="{
            gridColumnStart: getCol(a.position),
            gridRowStart: getRow(a.position),
          }"
        >
          <Arrow :dir="a.direction" />
        </n-icon>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, watchEffect, reactive } from "vue";
import Arrow from "./Arrow";
import { ArrowDir, Cell, Vec } from "../grid/types";
import Vector from "vector2js";
import Grid from "../grid/Grid";

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
const w = ref(52);
const b = ref(8);

const props = defineProps<{ cell: Cell }>();
const data = reactive({
  cell: props.cell,
});

const cWidth = ref(`${w.value}px`);
const bWidth = ref(`${b.value}px`);
const row = ref(`${(w.value - 2 * b.value) / 4}px`);
const col = ref(`${(w.value - b.value) / 2}px`);

function onFocus() {
  console.log(`onFocus`);
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
function getDir(i: number): ArrowDir[] {
  if (props.cell.splited) {
    return i < 2 ? ["right", "rightdown"] : ["down", "downright"];
  }
  return i < 1 ? ["right", "rightdown"] : ["down", "downright"];
}
function setArrow(p: Vec, direction: ArrowDir) {
  Grid.setArrow(props.cell, p, direction);
  refresh();
}
function onSplit() {
  Grid.setSplit(props.cell, !props.cell.splited);
  data.cell = props.cell;
  refresh();
}
function refresh() {
  version.value += 1;
}

const emit = defineEmits<{
  (event: "hover", value: string): void;
}>();
</script>

<style scoped>
.definition {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  width: 200px;
  height: 200px;
}
.separator {
  grid-area: 3 / 1 / 3 / 3;
  background: black;
  height: 1px;
}
.definputs {
  display: flex;
  flex-direction: column;
  grid-area: 1 / 1 / 5 / 3;
}
.def {
  border: 1px solid black;
  display: grid;
  width: v-bind(cWidth);
  height: v-bind(cWidth);
  grid-template-rows: 25% 25% 25% 25%;
  grid-template-columns: 50% 50%;
  /* grid-template-columns: v-bind(col) v-bind(bWidth) v-bind(col) v-bind(bWidth); */
  gap: 0px 0px;
  grid-auto-flow: row;
}
textarea {
  border: 0;
  padding: 0;
  margin: 0;
  text-align: center;
  text-anchor: start;
  max-width: 100%;
  height: 100%;
  resize: none;
  text-overflow: clip;
  overflow-wrap: anywhere;
  overflow: hidden;
}
input:focus {
  border: 0;
}
.arrow {
  height: 2em;
  width: 2em;
}
.handle {
  position: relative;
  cursor: pointer;
  padding: v-bind(`${b/2}px`);
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