<template>
  <div ref="container" class="grid exporter" :version="version">
    <div class="row" v-for="(row, i) in grid.cells" :key="i">
      <div
        class="cell"
        v-for="(cell, j) in row"
        :key="j"
        :style="{
          border: borders
            ? `${options.grid.borderSize} solid ${options.grid.borderColor}`
            : '',
        }"
      >
        <span class="text" v-if="!cell.definition">{{
          texts ? cell.text : ""
        }}</span>
        <div v-else class="definition">
          <span>{{ definitions && cell.text.length ? cell.text : "" }}</span>
          <div
            v-if="separators && cell.splited > 1"
            class="separator"
            :style="{
              gridRowStart: +Math.max(1, cell.splited * 2 - 1),
              gridColumnStart: 1,
              gridColumnEnd: 3,
            }"
          ></div>
        </div>
      </div>
    </div>
    <div class="arrows">
      <Arrow
        v-for="(dir, i) in directions"
        class="arrow"
        :dir="dir"
        :center="false"
        :key="i"
        :strokeColor="options.arrow.color"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import html2canvas from "html2canvas";
import { defineEmits, ref, defineProps, watchEffect, nextTick } from "vue";
import Arrow from "./Arrow";
import { Grid, GridOptions, ArrowDir, Vec } from "../grid";
import Vector from "vector2js";

const container = ref<HTMLDivElement>(null as any as HTMLDivElement);
const version = ref(1);
const directions = ref(["right", "rightdown", "down", "downright"]);
const borders = ref(true);

const props = defineProps<{
  grid: Grid;
  texts: boolean;
  definitions: boolean;
  separators: boolean;
  arrows: boolean;
  options: GridOptions;
}>();

const emit = defineEmits<{
  // (event: "type", value: number): void;
  (event: "exported", value: HTMLCanvasElement): void;
}>();

function exportPdf() {
  if (!container.value) return;
  const dirToId: Record<ArrowDir, number> = {
    right: 0,
    rightdown: 1,
    down: 2,
    downright: 3,
    none: 4,
  };
  const dpx = window.devicePixelRatio;
  const cellBB = container.value
    .querySelector(".cell")!
    .getBoundingClientRect();
  const spanBB = container.value
    .querySelector(".cell> span")!
    .getBoundingClientRect();
  const lineWidth = (cellBB.width - spanBB.width) / 2;

  const arrowSize = container.value
    .querySelector(".arrow")!
    .getBoundingClientRect();

  borders.value = false;

  return nextTick()
    .then(() => {
      const promises = [...container.value.querySelectorAll(".arrows>svg")].map(
        (svg) => {
          return new Promise((resolve) => {
            const blob = new Blob([svg.outerHTML], {
              type: "image/svg+xml;charset=utf-8",
            });
            const blobURL = URL.createObjectURL(blob);
            let image = document.createElement("img");
            image.onload = () => resolve(image);
            image.src = blobURL;
          });
        }
      );
      return Promise.all([html2canvas(container.value), ...promises]);
    })
    .then(([canvas, ...images]) => {
      const ctx = (canvas as HTMLCanvasElement).getContext(
        "2d"
      ) as CanvasRenderingContext2D;
      // container.value.appendChild(canvas as HTMLCanvasElement);
      // window.ctx = ctx;
      ctx.resetTransform();
      const cellWidth = canvas.width / props.grid.cols;
      const aw = arrowSize.width * dpx;

      ctx.strokeStyle = props.options.grid.borderColor;
      ctx.lineWidth = lineWidth;
      for (let i = 0; i < props.grid.rows + 1; i++) {
        ctx.moveTo(lineWidth, i * cellWidth);
        ctx.lineTo(lineWidth + props.grid.rows * cellWidth, i * cellWidth);
        ctx.stroke();
      }
      for (let i = 0; i < props.grid.cols + 1; i++) {
        ctx.moveTo(i * cellWidth, lineWidth);
        ctx.lineTo(i * cellWidth, lineWidth + props.grid.cols * cellWidth);
        ctx.stroke();
      }
      // ctx.rect(
      //   lineWidth,
      //   lineWidth,
      //   cellWidth * props.grid.cols - lineWidth,
      //   cellWidth * props.grid.rows - lineWidth
      // );
      // ctx.stroke();
      if (props.arrows) {
        props.grid.cells.forEach((row, i) => {
          row.forEach((cell, j) => {
            if (!cell.definition) return;
            cell.arrows.forEach(({ direction, position }, k) => {
              const x = (j + position.x) * cellWidth - aw / 2;
              const y = (i + position.y) * cellWidth - aw / 2;
              const img = images[dirToId[direction]];
              ctx.drawImage(img as any as HTMLImageElement, x, y, aw, aw);
            });
          });
        });
      }
      emit("exported", canvas as HTMLCanvasElement);
    });
}
watchEffect(() => {
  if (!props.grid) return;
  setTimeout(() => {
    exportPdf();
  }, 500);
});

function getRow(point: Vec, splited: number) {
  if (point.y === 1) return 9;
  if (splited <= 1) {
    return 5;
  }
  if (splited === 2) {
    return point.y == 0.25 ? 2 : 6;
  }
  if (splited === 3) {
    return point.y == 0.25 ? 3 : 7;
  }
  if (splited === 4) {
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
function refresh() {
  version.value++;
}
</script>

<style scoped>
.exporter {
  position: absolute;
  top: -200%;
  left: 200%;
  z-index: -1000;
  background: #fff;
}
.row {
  display: flex;
  flex-direction: row;
}
.grid {
  display: inline-flex;
  flex-wrap: nowrap;
  flex-direction: column;
  width: calc(v-bind(options.grid.cellSize) * v-bind(grid.rows));
}
.cell {
  width: v-bind(options.grid.cellSize);
  height: v-bind(options.grid.cellSize);
  cursor: text;
  display: grid;
  grid-template-rows: 0 50% 50%;
  grid-template-columns: 25% 25% 50%;
}
.cell > span {
  border: 0;
  grid-area: 1 / 1 / 4 / 4;
  background: #fff;
}
.text {
  display: flex;
  align-items: center;
  text-align: center;
  font-size: v-bind(options.grid.cellSize);
  text-transform: capitalize;
  justify-content: space-around;
  border: 0;
}
.separator {
  cursor: pointer;
  padding-top: 10px;
  border-bottom: 1px solid black;
  transform: translate(0, -100%);
}
.definition {
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
  color: v-bind(options.definition.color);
  font-family: v-bind(options.definition.font);
  font-size: v-bind(options.definition.size);
  line-height: calc(v-bind(options.grid.cellSize) / 4);
  text-overflow: clip;
  overflow-wrap: anywhere;
  grid-area: 1 / 1 / 4 / 4;
  display: grid;
  grid-template-rows: 12.5% 12.5% 12.5% 12.5% 12.5% 12.5% 12.5% 12.5%;
  grid-template-columns: 50% 50%;
  gap: 0px 0px;
  grid-auto-flow: row;
}
.definition > span {
  grid-area: 1 / 1/ 9 / 3;
}
.arrow {
  height: v-bind(options.arrow.size);
  width: v-bind(options.arrow.size);
}
.arrows {
  position: absolute;
  top: 0;
  left: 0;
  z-index: -100;
}
.n-icon {
  z-index: 10000;
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