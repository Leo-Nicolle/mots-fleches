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
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import WordsIndex from "../components/WordsIndex.vue";

import { getUrl } from "../js/utils";
import { Grid, GridOptions, SolutionOptions } from "grid";
import {
  defaultExportOptions,
  ExportOptions,
} from "../components/svg-renderer/types";
const grids = ref<Grid[]>([]);
const options = ref<SolutionOptions>();
const exportOptions = ref<ExportOptions>({
  ...defaultExportOptions,
  arrows: false,
  definitions: false,
});

function fetch() {
  return axios
    .get(getUrl("grid"))
    .then(({ data }) => {
      console.log("data", data);
      grids.value = data.map((g) => Grid.unserialize(JSON.stringify(g)));
    })
    .then(() => axios.get(getUrl(`options/solution`)))
    .then(({ data }) => {
      options.value = data;
      console.log(options.value, grids.value);
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

