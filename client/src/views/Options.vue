<template>
  <div class="options" v-if="options && grid">
    <div class="leftpanel">
      <n-scrollbar y-scrollable style="max-height: calc(100vh - 100px)">
        <GridForm v-if="grid" :model-value="grid" />
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
        style="max-height: calc(100vh - 100px); max-width: calc(100vw - 100px)"
      >
        <GridPaper
          v-if="grid && options"
          class="paper"
          :grid="grid"
          :export-options="{
            ...defaultExportOptions,
            texts: true,
            highlight: true,
          }"
          :options="options"
        />
      </n-scrollbar>
    </div>
    <ExportButton route="grid-export" :params="{ id: grid.id }" />
    <ExportSVGButton :grid="grid" />
  </div>
</template>

<script setup lang="ts">
import axios from "axios";
import GridPaper from "../components/GridPaper.vue";
import ExportButton from "../components/ExportButton.vue";
import ExportSVGButton from "../components/ExportSVG.vue";
import OptionsForm from "../components/forms/Options.vue";
import GridForm from "../components/forms/GridForm.vue";
import { defaultExportOptions } from "../components/svg-renderer/types";
import { Grid, GridOptions } from "grid";
import { getUrl } from "../js/utils";
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
  console.log("update");
  clearTimeout(saveTimeout.value);
  saveTimeout.value = setTimeout(() => {
    if (!options.value) return;
    console.log("post");

    axios.post(getUrl(`options`), {
      options: options.value,
    });
  }, 100);
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
