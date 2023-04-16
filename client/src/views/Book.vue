<template>
  <Book
    v-if="grids && options && solutionOptions"
    :grids="grids"
    :options="options"
    :solutionOptions="solutionOptions"
    :exportOptions="exportOptions"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";

import { getUrl } from "../js/utils";
import { Grid, GridOptions, SolutionOptions } from "grid";
import { ExportOptions } from "../components/svg-renderer/types";
import Book from "../components/Book.vue";
const route = useRoute();

const grids = ref<Grid[]>([]);
const options = ref<GridOptions>();
const solutionOptions = ref<SolutionOptions>();

const exportOptions = ref<Partial<ExportOptions>>({
  margins: false,
});

function fetch() {
  const promise = route.query.ids
    ? Promise.all(
        (route.query.ids as string)
          .split(",")
          .map((id) => axios.get(getUrl(`grid/${id}`)).then(({ data }) => data))
      ).then((data) => {
        grids.value = data.map((g) => Grid.unserialize(JSON.stringify(g)));
      })
    : axios.get(getUrl("grid")).then(({ data }) => {
        grids.value = data.map((g) => Grid.unserialize(JSON.stringify(g)));
      });
  return promise
    .then(() => axios.get(getUrl(`options/solution`)))
    .then(({ data }) => {
      solutionOptions.value = data;
    })
    .then(() => axios.get(getUrl(`options/default`)))
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

