<template>
  <div id="Options">
    <Editor v-if="grid && options" :grid="grid" :options="options">
      <n-scrollbar y-scrollable style="max-height: calc(100vh - 100px)">
        <OptionsForm
          v-model="options"
          @update:modelValue="onUpdate"
          grid
          definition
          arrows
          format
        />
      </n-scrollbar>
    </Editor>
  </div>
</template>

<script setup lang="ts">
import axios from "axios";
import Editor from "../components/Editor.vue";
import OptionsForm from "../components/forms/Options";
import { Grid, GridOptions } from "grid";
import { getUrl, save } from "../js/utils";
import { ref, onMounted, watchEffect } from "vue";
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
  console.log("update");
  clearTimeout(saveTimeout.value);
  saveTimeout.value = setTimeout(() => {
    if (!options.value) return;
    axios.post(getUrl(`options`), {
      options: options.value,
    })
  }, 150);
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
