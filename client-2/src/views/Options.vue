<template>
  <div id="Options">
    <Editor
      v-if="grid && options"
      :grid="grid"
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
  return Promise.all([
    axios.get(getUrl(`grid`)),
    axios.get(getUrl(`options/${route.params.id}`)),
  ])
    .then(([{ data: grids }, { data: opts }]) => {
      grid.value = Grid.unserialize(JSON.stringify(grids[0]));
      options.value = opts;
    })
    .catch((e) => {
      console.error("E", e);
    });
}
function onUpdate() {
  clearTimeout(saveTimeout.value);
  saveTimeout.value = setTimeout(() => {
    if(!options.value) return;
    save(options.value);
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
