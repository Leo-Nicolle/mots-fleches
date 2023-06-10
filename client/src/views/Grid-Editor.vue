<template>
  <div id="Grid">
    <Editor
      v-if="grid && options"
      :grid="grid"
      @update="onUpdate"
      @size-update="onSizeUpdate"
      :options="options"
    ></Editor>
  </div>
</template>

<script setup lang="ts">
import Editor from "../components/Editor.vue";
import { Grid, GridOptions } from "grid";
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { api } from "../api";
/**
 * Route to edit a grid
 * Uses the route query to get the grid id
 */
const grid = ref<Grid>();
const options = ref<GridOptions>();

const saveTimeout = ref(0);
const route = useRoute();
function fetch() {
  console.log('fetch');
  return api.getGrid(route.params.id as string)
  .then((g) => {
      grid.value = g as Grid;
      return api.db.getOption(grid.value.optionsId);
    })
    .then((opts) => {
      options.value = opts;
    })
    .catch((e) => {
      console.error("E", e);
    });
}
function onUpdate() {
  clearTimeout(saveTimeout.value);
  saveTimeout.value = setTimeout(() => {
    if (!grid.value) return;
    api.db.pushGrid(grid.value);
  }, 50);
}

function onSizeUpdate() {
  grid.value.resize(grid.value.rows, grid.value.cols);
  clearTimeout(saveTimeout.value);
  saveTimeout.value = setTimeout(() => {
    if (!grid.value) return;
    api.db.pushGrid(grid.value);
  }, 50);
}
onMounted(() => {
  fetch();
});
</script>

<style>
#Grid {
  max-height: 100vh;
  overflow: hidden;
}
body {
  width: min-content;
  max-width: 100vw;
  overflow: hidden;
}
</style>
