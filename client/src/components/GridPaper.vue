<template>
  <Paper
    :format="style.paper"
    :showMargins="exportOptions.margins"
    :showPagination="!!exportOptions.pagination"
    :pagination="pagination"
    :pageNumber="page"
  >
    <SVGGrid
      v-if="grid && style"
      :grid="grid"
      :focus="nullCell"
      dir="horizontal"
      :style="style"
      :export-options="exportOptions"
    />
  </Paper>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
import SVGGrid from "./svg-renderer/Grid.vue";
import Paper from "./Paper.vue";
import { Grid, GridStyle, nullCell, PaginationStyle } from "grid";
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
  style: GridStyle;
  /**
   * What to export
   */
  exportOptions: ExportOptions;
  pagination?: PaginationStyle;
  page: number;
}>();
</script>

<style lang="less">
</style>
