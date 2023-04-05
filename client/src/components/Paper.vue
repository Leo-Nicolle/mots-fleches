<template>
  <div class="page">
    <div class="body">
      <slot></slot>
    </div>
    <div v-if="showMargins">
      <div class="border left" :style="{ left: 0 }"></div>
      <div class="border right" :style="{ left: pageWidth }"></div>
      <div class="border top" :style="{ top: 0 }"></div>
      <div class="border bottom" :style="{ top: pageHeight }"></div>
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
    </div>
    <div class="footer"></div>
  </div>
</template>

<script setup lang="ts">
import { Format } from "grid";
import { defineProps } from "vue";
import { computed } from "vue";

const props = defineProps<{
  showMargins: boolean;
  format: Format;
}>();
const margins = computed(() => {
  if (!props.format) return [0, 0, 0, 0];
  return [
    `${props.format.margin.top}cm`,
    `${props.format.margin.right}cm`,
    `${props.format.margin.bottom}cm`,
    `${props.format.margin.left}cm`,
  ];
});
const pageSize = computed(() => {
  if (!props.format) return "A4";
  return `${props.format.width}cm ${props.format.height}cm`;
});

const pageWidth = computed(() => {
  if (!props.format) return 0;
  return `${props.format.width}cm`;
});
const pageHeight = computed(() => {
  if (!props.format) return 0;
  return `${props.format.height}cm`;
});
const bodyPadding = computed(() => {
  const {top, left, right, bottom} = props.format.margin;
  return [top, right, bottom, left].map(m => `${m}cm`).join(' ');
});

const bodyWidth = computed(() => {
  const {width,  margin} = props.format;
  const { left, right} = margin;
  return `${width - left - right}cm`;
});
const bodyHeight = computed(() => {
  const {height, margin} = props.format;
  const {top, bottom} = margin;
  return `${height - top - bottom}cm`;
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
  height: v-bind(bodyHeight);
  width: v-bind(bodyWidth);
  padding: v-bind(bodyPadding);
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
