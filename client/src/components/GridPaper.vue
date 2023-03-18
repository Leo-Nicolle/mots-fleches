<template>
  <div class="page">
    <div class="body">
      <SVGGrid
        v-if="grid && options"
        :grid="grid"
        :focus="nullCell"
        dir="horizontal"
        :options="options"
        :export-options="exportOptions"
      />
    </div>
    <div class="border left" :style="{ left: 0 }"></div>
    <div class="border right" :style="{ left: pageWidth }"></div>
    <div class="border top" :style="{ top: 0 }"></div>
    <div class="border bottom" :style="{ top: pageHeight }"></div>
    <div class="footer"></div>

    <div class="margin left" :style="{ left: margins[3] }"></div>
    <div
      class="margin right"
      :style="{ left: `calc(${pageWidth} - ${margins[1]})` }"
    ></div>
    <div class="margin top" :style="{ top: margins[0] }"></div>
    <div
      class="margin bottom"
      :style="{ top: `calc(${pageHeight} - ${margins[2]})` }"
    ></div>
    <div class="footer"></div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
import SVGGrid from "./svg-renderer/Grid.vue";
import { Grid, GridOptions, nullCell } from "grid";
import { computed } from "vue";
import { ExportOptions } from "../components/svg-renderer/types";

const props = defineProps<{
  grid: Grid;
  options: GridOptions;
  exportOptions: ExportOptions;
}>();
const margins = computed(() => {
  if (!props.options) return [0, 0, 0, 0];
  return [
    `${props.options.paper.margin.top}cm`,
    `${props.options.paper.margin.right}cm`,
    `${props.options.paper.margin.bottom}cm`,
    `${props.options.paper.margin.left}cm`,
  ];
});
const pageSize = computed(() => {
  if (!props.options) return "A4";
  return `${props.options.paper.width}cm ${props.options.paper.height}cm`;
});

const pageWidth = computed(() => {
  if (!props.options) return 0;
  return `${props.options.paper.width}cm`;
});
const pageHeight = computed(() => {
  if (!props.options) return 0;
  return `${props.options.paper.height}cm`;
});
</script>

<style lang="less">
@page {
  size: v-bind(pageSize);
  margin: 0;
}
.page {
  height: v-bind(pageHeight);
  width: v-bind(pageWidth);
  position: relative;
}
.body {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  height: v-bind(pageHeight);
  width: v-bind(pageWidth);
}

.border {
  position: absolute;
  border-right: 1px dashed black;
  border-bottom: 1px dashed black;
}
.margin {
  position: absolute;
  border-right: 1px dashed red;
  border-bottom: 1px dashed red;
}
.margin.left,
.margin.right,
.border.left,
.border.right {
  top: 0;
  bottom: 0;
  width: 0;
}
.margin.top,
.margin.bottom,
.border.top,
.border.bottom {
  left: 0;
  right: 0;
  height: 0;
}
</style>
