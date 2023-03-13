<template>
  <div class="options" v-if="options && grid">
    <div class="leftpanel">
      <n-scrollbar y-scrollable style="max-height: calc(100vh - 100px)">
        <GridForm v-if="grid"
          :grid="grid"
        />
        <OptionsForm
          v-model="options"
          @update:modelValue="onUpdate"
          grid
          definition
          arrows
          format
        />
      </n-scrollbar>
    </div>
    <div class="viewer">
      <n-scrollbar
        x-scrollable
        :on-scroll="onScroll"
        style="max-height: calc(100vh - 100px); max-width: calc(100vw - 100px)"
      >
        <GridPaper
          v-if="grid && options"
          class="paper"
          :grid="grid"
          :options="options"
        />
      </n-scrollbar>
    </div>
    <ExportButton :grid="grid" />
  </div>
</template>

<script setup lang="ts">
import axios from "axios";
import Editor from "../components/Editor.vue";
import GridPaper from "../components/GridPaper.vue";
import ExportButton from "../components/ExportButton.vue";
import ModalOptions from "../components/forms/ModalOptions.vue";
import OptionsForm from "../components/forms/Options";
import GridForm from "../components/forms/GridForm";

import { Grid, GridOptions } from "grid";
import { getUrl, save } from "../js/utils";
import { ref, onMounted, watchEffect } from "vue";
import { useRoute } from "vue-router";

const visible = ref(false);
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
    });
  }, 150);
}

onMounted(() => {
  fetch();
});
</script>

<style scoped>
.options {
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
.paper {
  margin: 20px;
}
.viewer {
  position: relative;
  top: 20px;
}
</style>
