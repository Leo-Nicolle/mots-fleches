<template>
  <div v-if="grids && solutionOptions">
    <Paper
      v-for="(gs, i) in gridsPerPage"
      :key="i"
      :format="solutionOptions.paper"
      :showMargins="exportOptions.margins"
      :page-number="page"
      :showPagination="exportOptions.pagination"
      :pagination="solutionOptions.pagination"
    >
      <div class="grids">
        <div v-for="(grid, j) in gs" :key="j" class="grid-c">
          <span class="gridN">{{ j + solutionOptions.pagination.startIdx }}</span>
          <SVGGrid
            :grid="grid"
            :focus="nullCell"
            dir="horizontal"
            :options="solutionOptions"
            :export-options="exportOptions"
          />
        </div>
      </div>
    </Paper>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from "vue";
import SVGGrid from "./svg-renderer/Grid.vue";
import Paper from "./Paper.vue";
import { Grid, nullCell, SolutionOptions } from "grid";
import { computed } from "vue";
import { ExportOptions } from "../types";

const emit = defineEmits<{
  pageCount: number;
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
  solutionOptions: SolutionOptions;
  /**
   * What to export
   */
  exportOptions: ExportOptions;
  /**
   * number of the first page
   */
  page: number;
}>();
const rows = computed(() => {
  if (!props.solutionOptions) return "";
  return `repeat(${props.solutionOptions.grids.rows},0)`;
});
const cols = computed(() => {
  if (!props.solutionOptions) return "";
  return `repeat(${props.solutionOptions.grids.cols},0)`;
});
const gridNFont = computed(() => {
  if (!props.solutionOptions) return "";
  return `${props.solutionOptions.grids.gridN.size} ${props.solutionOptions.grids.gridN.font}`;
});
const gridNColor = computed(() => {
  if (!props.solutionOptions) return "";
  return props.solutionOptions.grids.gridN.color;
});
const gridsPerPage = computed(() => {
  if (!props.solutionOptions) return [props.grids];
  const { rows, cols } = props.solutionOptions.grids;
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
