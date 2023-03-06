<template>
  <!-- <div ref="definition" class="definition" :version="version">
    <n-button icon-placement="right" @click="onSplit">
      {{ cell.splited ? "unsplit" : "split" }}
    </n-button> -->

  <!-- </div> -->
  <div>
    
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, watchEffect, reactive } from "vue";
import Arrow from "./Arrow";
import Vector from "vector2js";
import { Grid, ArrowDir, Cell, Vec } from "grid";

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

const props = defineProps<{ cell: Cell; width: string }>();
const emit = defineEmits<{
  (event: "click2", value: void): void;
}>();
const data = reactive({
  cell: props.cell,
});

function onFocus() {
  emit("click2");
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
    return i < 2
      ? ["none", "right", "rightdown"]
      : ["none", "down", "downright"];
  }
  return i < 1 ? ["none", "right", "rightdown"] : ["none", "down", "downright"];
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
  /* grid-area: 3 / 1 / 3 / 3; */
  position: relative;
  top: 50%;
  widows: 100%;
  background: black;
  height: 1px;
}
.definputs {
  display: flex;
  flex-direction: column;
  grid-area: 1 / 1 / 5 / 3;
}
.def {
  border: 0;
  display: grid;
  width: v-bind(width);
  height: v-bind(width);
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
  line-height: calc(v-bind(width) / 4 - 1px);
  text-overflow: clip;
  overflow-wrap: anywhere;
  overflow: hidden;
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