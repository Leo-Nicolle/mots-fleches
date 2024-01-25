<template>
  <!-- <WordsIndex v-if="grids && style" :grids="grids" class="paper" :export-options="exportOptions" :solutionStyle="style" /> -->
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import WordsIndex from "../../components/WordsIndex.vue";
import { Grid, SolutionStyle } from "grid";
import { defaultExportOptions, ExportOptions } from "../../types";
import { api } from "../../api";
const grids = ref<Grid[]>([]);
const style = ref<SolutionStyle>();
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

.leftpanel>.n-scrollbar {
  max-height: 100vh;
}

.viewer {
  top: 20px;
}
</style>

