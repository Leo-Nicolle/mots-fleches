<template>
  <div v-if="grids && solutionOptions">
    <Paper
      v-for="(gs, i) in gridsPerPage"
      :key="i"
      :format="solutionOptions.paper"
      :showMargins="exportOptions.margins"
    >
      <div class="grids">
        <SVGGrid
          v-for="(grid, j) in gs"
          :key="j"
          :grid="grid"
          :focus="nullCell"
          dir="horizontal"
          :options="solutionOptions"
          :export-options="exportOptions"
        />
      </div>
    </Paper>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
import SVGGrid from "./svg-renderer/Grid.vue";
import Paper from "./Paper.vue";
import { Grid, nullCell, SolutionOptions } from "grid";
import { computed } from "vue";
import { ExportOptions } from "../components/svg-renderer/types";

const props = defineProps<{
  grids: Grid[];
  solutionOptions: SolutionOptions;
  exportOptions: ExportOptions;
}>();
const rows = computed(() => {
  if (!props.solutionOptions) return "";
  return `repeat(${props.solutionOptions.grids.rows},0)`;
});
const cols = computed(() => {
  if (!props.solutionOptions) return "";
  return `repeat(${props.solutionOptions.grids.cols},0)`;
});
const gridsPerPage = computed(() => {
  if (!props.solutionOptions) return [props.grids];
  const { rows, cols } = props.solutionOptions.grids;
  const perPage = rows * cols;
  const pages = Math.ceil(props.grids.length / perPage);

  return new Array(pages)
    .fill(0)
    .map((_, i) => props.grids.slice(i * perPage, (i + 1) * perPage));
});
</script>

<style lang="less">
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
