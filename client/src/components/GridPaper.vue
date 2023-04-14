<template>
  <Paper :format="options.paper" :showMargins="exportOptions.margins">
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
import { ExportOptions } from "../components/svg-renderer/types";

const props = defineProps<{
  grid: Grid;
  options: GridOptions;
  exportOptions: ExportOptions;
}>();
</script>

<style lang="less">
</style>
