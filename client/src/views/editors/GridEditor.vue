<template>
  <div id="Grid">
    <Editor v-if="grid && style" :grid="grid" @update="onUpdate" @size-update="onSizeUpdate" :style="style"></Editor>
  </div>
</template>

<script setup lang="ts">
import Editor from "../../components/Editor.vue";
import { Grid, GridStyle } from "grid";
import { ref, onMounted, toRaw } from "vue";
import { useRoute } from "vue-router";
import { api } from "../../api";
import { workerController } from '../../worker';
/**
 * Route to edit a grid
 * Uses the route query to get the grid id
 */
const grid = ref<Grid>();
const style = ref<GridStyle>();

const saveTimeout = ref(0);
const route = useRoute();
function fetch() {
  return api
    .getGrid(route.params.id as string)
    .then((g) => {
      grid.value = g as Grid;
      return api.db.getStyle(grid.value.styleId);
    })
    .then((opts) => {
      style.value = opts;
    })
    .then(() => {
      api.getGrids().then((gs) => {
        const ids = gs.map((g) => g.id)
          .filter((id) => id !== grid.value!.id);
        return api.getUserDefinitions(ids);
      })
        .then((definitions) => workerController.setUserDefinitions(definitions));
    })
    .catch((e) => {
      console.error("E", e);
    });
}
function onUpdate() {
  clearTimeout(saveTimeout.value);
  saveTimeout.value = setTimeout(() => {
    if (!grid.value) return;
    api.db.pushGrid(toRaw(grid.value));
  }, 50);
}

function onSizeUpdate() {
  grid.value.resize(grid.value.rows, grid.value.cols);
  clearTimeout(saveTimeout.value);
  saveTimeout.value = setTimeout(() => {
    if (!grid.value) return;
    api.db.pushGrid(toRaw(grid.value));
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
