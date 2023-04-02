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
import axios from "axios";
import Editor from "../components/Editor.vue";
import { Grid, GridOptions } from "grid";
import { getUrl, save } from "../js/utils";
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";

const grid = ref<Grid>();
const options = ref<GridOptions>();

const saveTimeout = ref(0);
const route = useRoute();
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
function onUpdate() {
  clearTimeout(saveTimeout.value);
  saveTimeout.value = setTimeout(() => {
    if (!grid.value) return;
    save(grid.value);
  }, 50);
}

function onSizeUpdate() {
  clearTimeout(saveTimeout.value);
  saveTimeout.value = setTimeout(() => {
    if (!grid.value) return;
    grid.value.resize(grid.value.rows, grid.value.cols);
    save(grid.value);
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
