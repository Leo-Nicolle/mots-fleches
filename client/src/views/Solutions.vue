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
import axios from "axios";
import SolutionsPaper from "../components/Solutions.vue";

import { getUrl } from "../js/utils";
import {  Grid, GridOptions,SolutionOptions } from "grid";
import {
  defaultExportOptions,
  ExportOptions,
  
} from "../types";
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
  return axios
    .get(getUrl("grid"))
    .then(({ data }) => {
      grids.value = data.map((g) => Grid.unserialize(JSON.stringify(g)));
    })
    .then(() => axios.get(getUrl(`options/solution`)))
    .then(({ data }) => {
      options.value = data;
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

