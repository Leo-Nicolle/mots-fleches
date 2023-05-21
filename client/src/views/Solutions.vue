<template>
  <SolutionsPaper
    v-if="grids && options"
    :grids="grids"
    :solutionOptions="options"
    class="paper"
    :export-options="exportOptions"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import SolutionsPaper from "../components/Solutions.vue";
import { Grid, GridOptions, SolutionOptions } from "grid";
import { defaultExportOptions, ExportOptions } from "../types";
import { api } from "../api";
/**
 * View to print solutions
 */
const router = useRouter();
const grids = ref<Grid[]>([]);
const options = ref<SolutionOptions>();
const exportOptions = ref<ExportOptions>({
  ...defaultExportOptions,
  arrows: false,
  definitions: false,
  spaces: false,
});

function fetch() {
  return api
    .getGrids()
    .then((gs) => {
      grids.value = gs as Grid[];
    })
    .then(() => api.db.getOption("solution"))
    .then((opts) => {
      options.value = opts as SolutionOptions;
    })
    .catch((e) => {
      console.error("E", e);
    });
}
onMounted(() => {
  fetch();
});
</script>

<style scoped>
</style>

