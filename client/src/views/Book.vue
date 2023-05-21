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
import { Grid, GridOptions, SolutionOptions } from "grid";
import { ExportOptions } from "../types";
import Book from "../components/Book.vue";
import { api } from "../api";
/**
 * View to print a book of grids (with solutions and index)
 * it uses route querry to know which grids to print
 */
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
          .map((id) => api.getGrid(id))
      ).then((gs) => {
        grids.value = gs;
      })
    : api.getGrids().then((gs) => {
        grids.value = gs;
      });
  return promise
    .then(() => api.db.getOption("solution"))
    .then((solutions) => {
      solutionOptions.value = solutions as SolutionOptions;
    })
    .then(() => api.db.getOption("default"))
    .then((opts) => {
      options.value = opts as GridOptions;
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

