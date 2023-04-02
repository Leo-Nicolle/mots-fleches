<template>
  <GridPaper
    v-if="options && grid"
    :grid="grid"
    :options="options"
    :export-options="exportOptions"
  />
</template>

<script setup lang="ts">
import axios from "axios";
import GridPaper from "../components/GridPaper.vue";
import { Grid, GridOptions } from "grid";
import { getUrl, mergeRouteWithDefault } from "../js/utils";
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { defaultExportOptions } from "../components/svg-renderer/types";

const route = useRoute();
const grid = ref<Grid>();
const options = ref<GridOptions>();
const exportOptions = computed(() => mergeRouteWithDefault(route, defaultExportOptions));
function fetch() {
  return axios
    .get(getUrl(`grid/${route.params.id}`))
    .then(({ data }) => {
      grid.value = Grid.unserialize(JSON.stringify(data));
      return axios.get(getUrl(`options/${grid.value.optionsId}`));
    })
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

<style lang="less">
</style>
