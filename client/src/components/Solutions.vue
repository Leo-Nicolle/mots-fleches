<template>
  <div v-if="grids && solutionStyle">
    <FontLoader :value="solutionStyle.grids.gridN" />
    <Paper v-for="(gs, i) in gridsPerPage" :key="i" :format="printFormat" :showMargins="exportOptions.margins"
      :page-number="page + i" :showPagination="exportOptions.pagination" body-full-height
      :pagination="solutionStyle.pagination">
      <div class="grids">
        <div v-for="(grid, j) in gs" :key="j" class="grid-c">
          <span class="gridN">{{ j + solutionStyle.pagination.startIdx }}</span>
          <SVGGrid :grid="grid" :focus="nullCell" dir="horizontal" :style="solutionStyle"
            :export-options="exportOptions" :export-style="exportOptions" />
        </div>
      </div>
    </Paper>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from "vue";
import SVGGrid from "./svg-renderer/Grid.vue";
import Paper from "./Paper.vue";
import FontLoader from "./fonts/FontLoader.vue";
import { Format, Grid, nullCell, SolutionStyle } from "grid";
import { computed } from "vue";
import { ExportOptions } from "../types";
import { getFont } from "../js/useFont";

const emit = defineEmits<{
  (event: "pageCount", value: number): void;
}>();

/**
 * Component to render solution Grids
 */
const props = defineProps<{
  /**
   * The grids to render
   */
  grids: Grid[];
  /**
   * The styles to render the grids
   */
  solutionStyle: SolutionStyle;
  /**
   * What to export
   */
  exportOptions: ExportOptions;

  format?: Format;
  /**
   * number of the first page
   */
  page: number;
}>();
const printFormat = computed(() => props.format || props.solutionStyle.paper);
const rows = computed(() => {
  if (!props.solutionStyle) return "";
  const r = props.solutionStyle.grids.rows;
  const percent = Math.floor(100 / r);
  return `repeat(${r}, ${percent}%)`;
});
const cols = computed(() => {
  if (!props.solutionStyle) return "";
  const r = props.solutionStyle.grids.cols;
  const percent = Math.floor(100 / r);
  return `repeat(${r}, ${percent}%)`;
});
const gridNFont = computed(() => getFont(props.solutionStyle.grids.gridN));
const gridNColor = computed(() => {
  if (!props.solutionStyle) return "";
  return props.solutionStyle.grids.gridN.color;
});
const gridNMargin = computed(() => {
  if (!props.solutionStyle) return "";
  return props.solutionStyle.grids.gridN.margin.bottom;
});
const gridsPerPage = computed(() => {
  if (!props.solutionStyle) return [props.grids];
  const { rows, cols } = props.solutionStyle.grids;
  const perPage = rows * cols;
  const pages = Math.ceil(props.grids.length / perPage);
  emit("pageCount", pages);
  return new Array(pages)
    .fill(0)
    .map((_, i) => props.grids.slice(i * perPage, (i + 1) * perPage));
});
</script>

<style lang="less">
.grid-c {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.gridN {
  font: v-bind(gridNFont);
  margin-bottom: v-bind(gridNMargin);
  color: v-bind(gridNColor);
}

.grids {
  display: grid;
  align-content: space-around;
  justify-content: space-around;
  grid-template-columns: v-bind(cols);
  grid-template-rows: v-bind(rows);
  align-items: center;
  justify-items: center;
  max-width: 100%;
  max-height: 100%;
  width: 100%;
  height: 100%;
}
</style>
