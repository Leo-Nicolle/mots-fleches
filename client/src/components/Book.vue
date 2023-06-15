<template>
  <div class="book" v-if="grids && options && solutionOptions">
    <GridPaper
      v-for="(grid, i) in grids"
      :key="grid.id"
      :grid="grid"
      :options="options"
      :exportOptions="gridExport"
      :page="solutionOptions.pagination.startIdx + i"
    />
    <IndexPaper
      :grids="grids"
      :solutionOptions="solutionOptions"
      :exportOptions="solutionExport"
      :page="solutionOptions.pagination.startIdx + grids.length"
      @pageCount="evt => indexPages=evt"
    />
    <SolutionPaper
      :grids="grids"
      :solutionOptions="solutionOptions"
      :exportOptions="solutionExport"
      :page="solutionOptions.pagination.startIdx + grids.length + indexPages"
    />
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref } from "vue";
import { Grid, GridOptions, SolutionOptions } from "grid";
import { computed } from "vue";
import { defaultExportOptions, ExportOptions } from "../types";
import GridPaper from "./GridPaper.vue";
import IndexPaper from "./WordsIndex.vue";
import SolutionPaper from "./Solutions.vue";

/**
 * Component to render the whole book: grids, index and solutions
 */
const props = defineProps<{
  /**
   * The grids to render
   */
  grids: Grid[];
  /**
   * The options to render the grids
   */
  options: GridOptions;
  /**
   * The options to render the solutions
   */
  solutionOptions: SolutionOptions;
  /**
   * Extra options to override the options and solutionOptions
   */
  exportOptions: Partial<ExportOptions>;
}>();
const indexPages = ref(0);

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
    spaces: false,
    definitions: false,
  },
  ...props.exportOptions,
}));

</script>

<style lang="less">
</style>
