<template>
  <Paper :format="options.paper" :showMargins="exportOptions.margins">
    <div v-if="grids && options" class="grids">
      <SVGGrid
        v-for="(grid, i) in grids"
        :key="i"
        :style="getStyle(i)"
        :grid="grid"
        :focus="nullCell"
        dir="horizontal"
        :options="options"
        :export-options="exportOptions"
      />
    </div>
  </Paper>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
import SVGGrid from "./svg-renderer/Grid.vue";
import Paper from "./Paper.vue";
import { Grid, GridOptions, nullCell } from "grid";
import { computed } from "vue";
import { ExportOptions, SolutionOptions } from "../components/svg-renderer/types";

const props = defineProps<{
  grids: Grid[];
  options: GridOptions;
  exportOptions: ExportOptions;
  solutionsOptions: SolutionOptions;
}>();
console.log(props.options)
const rows = computed(() => {
  if (!props.solutionsOptions) return 1;
  return new Array(props.solutionsOptions.grids.rows).fill(`${props.solutionsOptions.grids.rows}fr`).join(' ');
});
const cols = computed(() => {
  if (!props.solutionsOptions) return 1;
  return new Array(props.solutionsOptions.grids.cols).fill(`${props.solutionsOptions.grids.cols}fr`).join(' ');
});

function getStyle(i : number){
  const row = Math.floor(i / props.solutionsOptions.grids.cols);
  const col = i % props.solutionsOptions.grids.cols;

  return {gridArea: `${row+1} ${col+1} 1 1`}
}


</script>

<style lang="less">

.grids {
  // display: grid;
  // grid-template-rows: v-bind(rows);
  // grid-template-columns: v-bind(cols);
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-evenly;
  max-width: 100%;
  max-height: 100%;
}

</style>
