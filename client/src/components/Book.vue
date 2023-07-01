<template>
  <div class="book" v-if="grids && style && solutionStyle">
    <GridPaper
      v-for="(grid, i) in grids"
      :key="grid.id"
      :grid="grid"
      :style="style"
      :exportOptions="gridExport"
      :pagination="solutionStyle.pagination"
      :page="solutionStyle.pagination.startIdx + i"
    />
    <IndexPaper
      :grids="grids"
      :solutionStyle="solutionStyle"
      :exportOptions="solutionExport"
      :page="solutionStyle.pagination.startIdx + grids.length"
      @pageCount="evt => indexPages=evt"
    />
    <SolutionPaper
      :grids="grids"
      :solutionStyle="solutionStyle"
      :exportOptions="solutionExport"
      :page="solutionStyle.pagination.startIdx + grids.length + indexPages"
    />
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref } from "vue";
import { Grid, GridStyle, SolutionStyle } from "grid";
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
   * The style to render the grids
   */
  style: GridStyle;
  /**
   * The style to render the solutions
   */
  solutionStyle: SolutionStyle;
  /**
   * Extra options to override the options and solutionStyle
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
