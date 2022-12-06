<template>
  <div ref="definition" class="definition" :version="version">
    Definition
    <n-button icon-placement="right" @click="onSplit">
      {{ cell.splited ? "unsplit" : "split" }}
    </n-button>
    <div class="def">
      <div
        type="text"
        :style="{
          background: 'red',
          gridArea: '2 / 2 / 5 / 5'
        }"
      ></div>
      <input
        v-if="cell.splited"
        type="text"
        :style="{
          gridColumnStart: 4,
          gridColumnEnd: 5,
          gridRowStart: 2,
          gridRowEnd: 2,
        }"
      />
      <button
        v-for="(point, i) in points[+cell.splited]"
        :key="i"
        class="handle"
        :style="{
          gridColumnStart: 4,
          gridColumnEnd: 5,
          gridRowStart: 2,
          gridRowEnd: 2,
        }"
      ></button>
      <button
        v-for="(point, i) in points[+cell.splited]"
        :key="i"
        class="handle"
        :style="{
          gridRowStart: 5,
          gridColumnStart: 3,
        }"
      ></button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, watchEffect, reactive } from "vue";
import Arrow from "./Arrow";
import { ArrowDir, Cell, Vec } from "../grid/types";
import Vector from "vector2js";
import Grid from "../grid/Grid";
/*
 <n-icon
          class="arrow"
          v-for="(a, i) in cell.arrows"
          :style="{
            // left: `${getHanldePosition(a.position, 8).x}px`,
            // top: `${getHanldePosition(a.position, 8).y}px`,
          }"
          :key="i"
        >
          <Arrow :dir="a.direction" />
        </n-icon>
 <n-popover
        v-for="(p, i) in points[+cell.splited]"
        :key="i"
        trigger="hover"
      >
        <template #trigger> </template>
        <span>
          <n-button
            v-for="(dir, j) in getDir(i)"
            :key="j"
            icon-placement="right"
            @click="setArrow(p, dir)"
          >
            <template #icon>
              <n-icon>
                <Arrow :dir="dir" />
              </n-icon>
            </template>
          </n-button>
        </span>
      </n-popover>

*/
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
const w = ref(52);
const props = defineProps<{ cell: Cell }>();
const data = reactive({
  cell: props.cell,
});

const cellWidth = ref(`${52}px`);
const buttonWidth = ref(`${4}px`);

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
  // const v = new Vector(x, y);
  // let offset = Vector.zero;
  // if (o) {
  //   offset = p.x > p.y ? { x: 0, y: o } : { x: o, y: 0 };
  // }
  return new Vector(p.x, p.y).mul({ x: width, y: height });
  // .add(v);
  // .sub(offset)
  // .sub(4);
}

function getDir(i: number): ArrowDir[] {
  console.log("getDir", i, props.cell.splited);
  if (props.cell.splited) {
    return i < 2 ? ["right", "rightdown"] : ["down", "downright"];
  }
  return i < 1 ? ["right", "rightdown"] : ["down", "downright"];
}
function setArrow(p: Vec, direction: ArrowDir) {
  const c = props.cell;
  c.arrows = c.arrows
    .filter(({ position }) => !Grid.equal(position, p))
    .concat({ position: p, direction });
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
.def {
  width: v-bind(cellWidth);
  min-height: v-bind(cellWidth);
  border: 1px solid black;
  display: grid;
  grid-template-rows: 4px 26px 4px 26px 4px;
  grid-template-columns: 4px 26px 4px 26px 4px;
  gap: 0px 0px;
  grid-auto-flow: row;
}
input {
  width: v-bind(cellWidth);
  height: 100%;
  border: 0;
  padding: 0;
  margin: 0;
  text-align: center;
}
input:focus {
  border: 0;
}
.arrows {
  width: v-bind(cellWidth);
}
.arrows > .arrow {
  font-size: 20px;
  position: absolute;
}
.handle {
  position: relative;
  cursor: pointer;
  padding: v-bind(buttonWidth);
  height: 0;
  border: 0;
  border-radius: 50%;
  z-index: 100;
  background: #333;
  transform: translate(-50%, -50%);
}
img {
  width: 100%;
}
</style>