<template>
  <div ref="definition" class="definition" :version="version">
    Definition
    <Arrow dir="down" />
    <Arrow dir="downright" />

    <n-button icon-placement="right" @click="split = !split">
      {{ split ? "unsplit" : "split" }}
    </n-button>
    <div class="def">
      <div :style="{ height: `${split ? '26px' : '100%'}` }"></div>
      <n-popover v-for="(p, i) in points" :key="i" trigger="hover">
        <template #trigger>
          <button
            :style="{
              left: `${getHanldePosition(p).x}px`,
              top: `${getHanldePosition(p).y}px`,
            }"
          ></button>
        </template>
        <span>
          <n-button
            v-for="(dir, j) in getDir(i)"
            :key="j"
            icon-placement="right"
            @click="setArrow(points[i], dir)"
          >
            <template #icon>
              <n-icon>
                <Arrow :dir="dir" />
              </n-icon>
            </template>
          </n-button>
        </span>
      </n-popover>
    </div>

    <div class="arrows">
      <n-icon
        class="arrow"
        v-for="(a, i) in cell.arrows"
        :style="{
          left: `${getHanldePosition(a.point, 8).x}px`,
          top: `${getHanldePosition(a.point, 8).y}px`,
        }"
        :key="i"
      >
        <Arrow :dir="a.direction" />
      </n-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, watchEffect } from "vue";
import Arrow from "./Arrow";
import { Cell, Vec } from "../grid/types";
import Vector from "vector2js";
import Grid from "../grid/Grid";
import { Refresh } from "@vicons/ionicons5";
const definition = ref(null);
const version = ref(0);
const split = ref(false);
const points = ref<Vec[]>([]);
const w = ref(52);
const props = defineProps<{ cell: Cell }>();

const cellWidth = ref(`${52}px`);
const buttonWidth = ref(`${4}px`);

watchEffect(() => {
  const v = new Vector(w.value, w.value);
  points.value = split.value
    ? [
        { x: 1, y: 0.25 },
        { x: 1, y: 0.75 },
        { x: 0.5, y: 1 },
      ]
    : [
        { x: 1, y: 0.5 },
        { x: 0.5, y: 1 },
      ];

      //todo make it work
  if (split.value && props.cell.arrows.some((a) => a.point.x === 1)) {
    const a = props.cell.arrows.find((a) => a.point.x === 1);
    a.point.y = 0.25;
  }
  if (split.value && props.cell.arrows.some((a) => a.point.x === 1)) {
    const as = props.cell.arrows.filter((a) => a.point.x === 1);
    as[0].point.y = 0.5;
    // props.cell.arrows = props.cell.arrows.filter(
    //   (a) => a.point.x < 1 || a.point.y === 0.5
    // );
  }
  refresh();
});

function getHanldePosition(p: Vec, o = 0) {
  if (!definition.value) return { x: 0, y: 0 };
  const { x, y, width, height } = definition.value
    .querySelector(".def")
    .getBoundingClientRect();
  const v = new Vector(x, y);
  let offset = Vector.zero;
  if (o) {
    offset = p.x > p.y ? { x: 0, y: o } : { x: o, y: 0 };
  }
  return new Vector(p.x, p.y)
    .mul({ x: width, y: height })
    .add(v)
    .sub(offset)
    .sub(4);
}

function getDir(i: number) {
  if (points.value.length === 3) {
    return i < 2 ? ["right", "rightdown"] : ["down", "downright"];
  } else {
    return i < 1 ? ["right", "rightdown"] : ["down", "downright"];
  }
}
function setArrow(p, direction) {
  const c = props.cell;
  c.arrows = c.arrows
    .filter(({ point }) => !Grid.equal(point, p))
    .concat({ point: p, direction });
  console.log(c.arrows);
  refresh();
}
function refresh() {
  version.value += 1;
}

const emit = defineEmits<{
  (event: "hover", value: string): void;
}>();
</script>

<style>
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
}
.def > div {
  width: v-bind(cellWidth);
  border-bottom: 1px solid black;
}
.arrows {
  width: v-bind(cellWidth);
}
.arrows > .arrow {
  font-size: 20px;
  position: absolute;
}
.def > button {
  position: absolute;
  cursor: pointer;
  padding: v-bind(buttonWidth);
  height: 0;
  border: 0;
  border-radius: 50%;
  z-index: 100;
  background: #333;
}
img {
  width: 100%;
}
</style>