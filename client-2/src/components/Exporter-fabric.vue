<template>
  <div ref="container" class="grid exporter" :version="version">
    <canvas ref="exportcanvas"></canvas>
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
import { fabric } from "fabric";
import {
  defineEmits,
  onMounted,
  ref,
  defineProps,
  watchEffect,
  nextTick,
} from "vue";
import { Grid, GridOptions, ArrowDir } from "../grid";
import Arrow from "./Arrow";


const ruler = document.createElement("div");
ruler.classList.add("hidden-input");
document.body.appendChild(ruler);
const exportcanvas = ref(null);
const container = ref<HTMLDivElement>(null as any as HTMLDivElement);
const version = ref(1);
const directions = ref(["right", "rightdown", "down", "downright"]);
const borders = ref(true);
let f: fabric.Canvas;
let timeout = 0;
const props = defineProps<{
  grid: Grid;
  texts: boolean;
  definitions: boolean;
  shouldExport: boolean;
  separators: boolean;
  arrows: boolean;
  options: GridOptions;
}>();

const emit = defineEmits<{
  (event: "exported", value: HTMLCanvasElement): void;
}>();

function exportCanvas() {
  if (!container.value) return;
  console.log('export')
  const dirToId: Record<ArrowDir, number> = {
    right: 0,
    rightdown: 1,
    down: 2,
    downright: 3,
    none: 4,
  };
  const dpx = window.devicePixelRatio;
  const cellBB = document
    .querySelector(".cell>input")!
    .getBoundingClientRect();
  const lineWidth = +props.options.grid.borderSize.slice(0, -2);

  const arrowSize = container.value
    .querySelector(".arrow")!
    .getBoundingClientRect();

  borders.value = false;
  const width = (props.grid.cols + 1) * cellBB.width;
  const height = (props.grid.rows + 1) * cellBB.height;
  f.setDimensions({
    width,
    height,
  });
  f.clear();

  const defHeihgt = +props.options.definition.size.slice(0, -2);
  // create a wrapper around native canvas element (with id="c")
  return nextTick()
    .then(() => {

      const imgs = [...container.value.querySelectorAll(".arrows>svg")].map(
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
      return Promise.all([
        Promise.all([]),
        Promise.all(imgs),
      ]);
    })
    .then(([definitions, imgs]) => {
      const cellWidth = cellBB.width; //canvas.width / props.grid.cols;
      const aw = arrowSize.width * dpx;
      const arrowBB = document
        .querySelector(".arrow")
        ?.getBoundingClientRect() as DOMRect;
      const canvasArrows = imgs.map((img) => {
        const canvas = document.createElement("canvas");
        canvas.width = arrowBB.width;
        canvas.height = arrowBB.height;
        canvas.getContext("2d")?.drawImage(img, 0, 0);
        return canvas;
      });
      for (let i = 0; i < props.grid.cells.length; i++) {
        const row = props.grid.cells[i];
        for (let j = 0; j < row.length; j++) {
          const cell = row[j];
          if (cell.definition) {
            const tb = new fabric.Text(cell.text, {
              left: cell.x * cellWidth,
              top: cell.y * cellWidth,
              width: cellWidth,
              height: cellWidth,
              lineHeight: Math.floor(cellWidth / defHeihgt / 4),
              fontSize: defHeihgt,
              textAlign: "center",
              hasBorders: true,
              hasControls: false,
              hasRotatingPoint: false,
              lockSkewingX: true,
              lockSkewingY: true,
              fontFamily: props.options.definition.font,
            });
            f.add(tb);
            tb.setOptions({
              width: cellWidth,
              height: cellWidth,
            });
            if (cell.splited) {
              console.log("splited", cell.splited);
              const y =
                (cell.y + (cell.splited - 1) / 4) * cellWidth - lineWidth;
              f.add(
                new fabric.Line([i * cellWidth, y, (i + 1) * cellWidth, y], {
                  stroke: props.options.grid.borderColor,
                  strokeWidth: lineWidth,
                })
              );
            }

            cell.arrows.forEach((arrow) => {
              const x =
                (cell.x + arrow.position.x) * cellWidth - arrowBB.width / 2;
              const y =
                (cell.y + arrow.position.y) * cellWidth - arrowBB.height / 2;
              const a =
                canvasArrows[
                  directions.value.findIndex((d) => arrow.direction == d)
                ];
              f.add(
                new fabric.Image(a, {
                  left: x,
                  top: y,
                })
              );
            });
          }
        }
      }

      for (let i = 0; i < props.grid.rows + 1; i++) {
        f.add(
          new fabric.Line(
            [
              lineWidth,
              i * cellBB.width,
              lineWidth + props.grid.cols * cellBB.width,
              i * cellWidth,
            ],
            {
              stroke: props.options.grid.borderColor,
              strokeWidth: lineWidth,
            }
          )
        );
      }
      for (let i = 0; i < props.grid.cols + 1; i++) {
        f.add(
          new fabric.Line(
            [
              i * cellWidth,
              lineWidth,
              i * cellWidth,
              lineWidth + props.grid.cols * cellWidth,
            ],
            {
              stroke: props.options.grid.borderColor,
              strokeWidth: lineWidth,
            }
          )
        );
      }
      // container.value.appendChild(f.toCanvasElement());

      // emit("exported", f.);
    });
}

watchEffect(() => {
  if (!props.grid || !props.shouldExport) return;
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    exportCanvas();
  }, 100);
});

setInterval(() => {
  exportCanvas();
}, 2000);
function refresh() {
  version.value++;
}
onMounted(() => {
  f = new fabric.Canvas(exportcanvas.value);
});
</script>

<style scoped>
.exporter {
  position: absolute;
  top: -200%;
  left: 200%;
  z-index: -1000;
  background: #fff;
  z-index: 1000;
  top: 300px;
  left: 0;
}
.row {
  display: flex;
  flex-direction: row;
  position: absolute;
  top: -200%;
  left: 200%;
}
.grid {
  display: inline-flex;
  flex-wrap: nowrap;
  flex-direction: column;
  width: calc(v-bind(options.grid.cellSize) * v-bind(grid.rows));
  padding: calc(v-bind(options.grid.borderSize) * 2);
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
}
.arrow {
  height: v-bind(options.arrow.size);
  width: v-bind(options.arrow.size);
}
.arrows {
  position: absolute;
  top: -1000px;
  left: -1000px;
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