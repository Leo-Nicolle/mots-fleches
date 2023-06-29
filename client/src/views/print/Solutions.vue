<template>
  <SolutionsPaper
    v-if="grids && style"
    :grids="grids"
    :solutionStyle="style"
    class="paper"
    :export-options="exportOptions"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import SolutionsPaper from "../../components/Solutions.vue";
import { Grid, SolutionStyle } from "grid";
import { defaultExportOptions, ExportOptions } from "../../types";
import { api } from "../../api";
/**
 * View to print solutions
 */
const grids = ref<Grid[]>([]);
const style = ref<SolutionStyle>();
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
    .then(() => api.db.getStyle("solution"))
    .then((s) => {
      style.value = s as SolutionStyle;
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

