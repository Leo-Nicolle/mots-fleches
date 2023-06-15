<template>
  <Paper
    :format="options.paper"
    :showMargins="exportOptions.margins"
    :showPagination="!!exportOptions.pagination"
    :pagination="exportOptions.pagination"
    :pageNumber="page"
  >
    <SVGGrid
      v-if="grid && options"
      :grid="grid"
      :focus="nullCell"
      dir="horizontal"
      :options="options"
      :export-options="exportOptions"
    />
  </Paper>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
import SVGGrid from "./svg-renderer/Grid.vue";
import Paper from "./Paper.vue";
import { Grid, GridOptions, nullCell } from "grid";
import { ExportOptions } from "../types";
/**
 * Component to render a grid (for printing)
 */
const props = defineProps<{
  /**
   * The grid to render
   */
  grid: Grid;
  /**
   * The styles to render the grid
   */
  options: GridOptions;
  /**
   * What to export
   */
  exportOptions: ExportOptions;

  page: number;
}>();
</script>

<style lang="less">
</style>
