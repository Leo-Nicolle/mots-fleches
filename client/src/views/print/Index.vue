<template>
  <WordsIndex
    v-if="grids && options"
    :grids="grids"
    class="paper"
    :export-options="exportOptions"
    :solutionOptions="options"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import WordsIndex from "../../components/WordsIndex.vue";
import { Grid, SolutionOptions } from "grid";
import { defaultExportOptions, ExportOptions } from "../../types";
import { api } from "../../api";
const grids = ref<Grid[]>([]);
const options = ref<SolutionOptions>();
const exportOptions = ref<ExportOptions>({
  ...defaultExportOptions,
  arrows: false,
  definitions: false,
});

function fetch() {
  return api
    .getGrids()
    .then((gs) => {
      grids.value = gs;
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
.paper {
  margin: 20px;
}
.solutions {
  display: flex;
  flex-direction: row;
  height: 100%;
}
.leftpanel {
  width: 210px;
  min-width: 210px;
  overflow: hidden;
}
.leftpanel > .n-scrollbar {
  max-height: 100vh;
}
.viewer {
  position: relative;
  top: 20px;
}
</style>

