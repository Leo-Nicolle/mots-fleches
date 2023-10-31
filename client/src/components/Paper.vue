<template>
  <div class="page" ref="page">
    <FontLoader v-if="props.pagination" :value="props.pagination" />
    <div class="content">
      <div :class="`body ${bodyClass} || ''`">
        <slot></slot>
      </div>
      <div class="footer">
        <div v-if="showPagination" class="pagination">
          <span>
            {{ pageNumber }}
          </span>
        </div>
      </div>
    </div>
    <div class="borders" v-if="showMargins">
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
  </div>
</template>

<script setup lang="ts">
import { Format, PaginationStyle } from "grid";
import { defineProps, ref } from "vue";
import { computed } from "vue";
import FontLoader from "./fonts/FontLoader.vue";
import { getFont } from "../js/useFont";
/**
 * Component to render a Page (for printing)
 */
const page = ref();
const props = defineProps<{
  /**
   * Whether to show the margins lines
   */
  showMargins: boolean;
  /**
   * Paper format
   */
  format: Format;
  /**
   * Class to add to the body
   */
  bodyClass?: string;
  pageNumber?: number;
  showPagination: boolean;
  pagination?: PaginationStyle;
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
const paginationFont = computed(() => getFont(props.pagination));
const paginationColor = computed(() => {
  if (!props.pagination) return "";
  return `${props.pagination.color}`;
});
const paginationJustify = computed(() => {
  return props.pagination
    ? props.pagination.align === "center"
      ? "space-around"
      : (props.pageNumber || 0) % 2
      ? "flex-start"
      : "flex-end"
    : "";
});
const pageWidth = computed(() => {
  if (!props.format) return 0;
  return `${props.format.width}cm`;
});
const pageHeight = computed(() => {
  if (!props.format) return 0;
  return `${props.format.height}cm`;
});
const padding = computed(() => {
  const { top, left, right, bottom } = props.format.margin;
  return [top, right, bottom, left].map((m) => `${m}cm`).join(" ");
});
const formatStyle = computed(() => {
  if (!props.format) return "";
  return `${props.format.width}cm ${props.format.height}cm`;
});
</script>

<style lang="scss">
body {
  margin: 0;
}

@page {
  margin: 0;
  padding: 0;
  size: v-bind(formatStyle);
}
@media print {
  button {
    display: none;
  }
}
.page {
  height: v-bind(pageHeight);
  width: v-bind(pageWidth);
  padding: v-bind(padding);
  position: relative;
  break-inside: avoid;
  box-sizing: border-box;
  .content {
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: space-between;
    .body {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-around;
      height: 100%;
      width: 100%;
    }
    .footer {
      .pagination {
        width: 100%;
        display: flex;
        flex-direction: row;
        // margin-top: auto;
        font: v-bind(paginationFont);
        color: v-bind(paginationColor);
        justify-content: v-bind(paginationJustify);
      }
    }
  }
  .borders {
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
  }
}
</style>
