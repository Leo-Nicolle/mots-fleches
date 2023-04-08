<template>
  <Paper :format="options.paper" :showMargins="exportOptions.margins">
    <div v-if="grids && options" class="grids">
    </div>
  </Paper>
</template>

<script setup lang="ts">
import { defineProps, watch } from "vue";
import Paper from "./Paper.vue";
import { Grid, GridOptions, nullCell } from "grid";
import { computed } from "vue";
import {
  ExportOptions,
  SolutionOptions,
} from "../components/svg-renderer/types";

const props = defineProps<{
  grids: Grid[];
  options: GridOptions;
  exportOptions: ExportOptions;
  solutionsOptions: SolutionOptions;
}>();
const rows = computed(() => {
  if (!props.solutionsOptions) return '';
  return `repeat(${props.solutionsOptions.grids.rows},0)`;
});
const cols = computed(() => {
  if (!props.solutionsOptions) return '';
  return `repeat(${props.solutionsOptions.grids.cols},0)`;
});
watch(props.solutionsOptions, () => {
  console.log('solutionsOptions changed' ,props.solutionsOptions.grids.rows, props.solutionsOptions.grids.cols);
});

function getStyle(i: number) {
  const row = Math.floor(i / props.solutionsOptions.grids.cols);
  const col = i % props.solutionsOptions.grids.cols;

  return { gridArea: `${row + 1} ${col + 1} 1 1` };
}
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
