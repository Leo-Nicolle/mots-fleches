<template>
  <GridPaper v-if="style && grid" :grid="grid" :style="style" :pagination="undefined" :page="0"
    :export-options="exportOptions" />
</template>

<script setup lang="ts">
import GridPaper from "../../components/GridPaper.vue";
import { Grid, GridStyle } from "grid";
import { mergeRouteWithDefault } from "../../js/utils";
import { ref, onMounted, computed, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import { defaultExportOptions } from "../../types";
import { api } from "../../api";
import { cleanupPrintMessage, usePrintMessage } from "../../js/usePrintMessage";
/**
 * View to print a grid
 * Uses route params to know which grid to print
 */
const route = useRoute();
const grid = ref<Grid>();
const style = ref<GridStyle>();
const exportOptions = computed(() =>
  mergeRouteWithDefault(route, defaultExportOptions)
);
function fetch() {
  return api
    .getGrid(route.query.id as string)
    .then((g) => {
      grid.value = g as Grid;
      return api.db.getStyle(grid.value.styleId);
    })
    .then((s) => {
      style.value = s;
    })
    .catch((e) => {
      console.error("E", e);
    });
}

onMounted(() => {
  fetch()
    .then(() => usePrintMessage());
});
onUnmounted(() => {
  cleanupPrintMessage();
});
</script>

<style lang="less"></style>
