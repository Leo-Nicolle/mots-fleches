<template>
  <div class="book" v-if="grids && options && solutionOptions">
    <GridPaper 
    v-for="(grid, i) in grids"
    :key="grid.id"
    :grid="grid"
    :options="options"
    :exportOptions="gridExport"/>
    <IndexPaper
      :grids="grids"
      :solutionOptions="solutionOptions"
      :exportOptions="solutionExport"
    />
    <SolutionPaper
      :grids="grids"
      :solutionOptions="solutionOptions"
      :exportOptions="solutionExport"
    />
  </div>
</template>

<script setup lang="ts">
import { defineProps, watch } from "vue";
import { Grid, GridOptions, SolutionOptions, nullCell } from "grid";
import { computed } from "vue";
import { defaultExportOptions, ExportOptions } from "./svg-renderer/types";
import GridPaper from "./GridPaper.vue";
import SVGGrid from "./svg-renderer/Grid.vue";
import IndexPaper from "./WordsIndex.vue";
import SolutionPaper from "./Solutions.vue";

const props = defineProps<{
  grids: Grid[];
  options: GridOptions;
  solutionOptions: SolutionOptions;
  exportOptions: Partial<ExportOptions>;
}>();
const gridExport = computed(() => ({
  ...defaultExportOptions,
  ...{
    texts: false,
    arrows: true,
    definitions: true,
    splits: true,
  },
  ...props.exportOptions,
}));

const solutionExport = computed(() => ({
  ...defaultExportOptions,
  ...{
    words: true,
    arrows: false,
    splits: false,
    definitions: false,
  },
  ...props.exportOptions,
}));
</script>

<style lang="less">
</style>
