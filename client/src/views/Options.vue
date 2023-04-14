<template>
  <Layout>
    <template v-slot:header v-if="grid">
      <ExportButton route="grid-export" :params="{ id: grid.id }" />
      <ExportSVGButton :grid="grid" />
    </template>
    <template v-slot:left-panel v-if="options && grid">
      <n-scrollbar y-scrollable style="max-height: calc(100vh - 100px)">
        <GridForm :model-value="grid" />
        <OptionsForm
          v-model="options"
          @update:modelValue="onUpdate"
          grid
          definition
          arrows
          format
        />
      </n-scrollbar>
    </template>
    <template v-slot:body>
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
    </template>
</Layout>

</template>

<script setup lang="ts">
import axios from "axios";
import GridPaper from "../components/GridPaper.vue";
import ExportButton from "../components/ExportButton.vue";
import ExportSVGButton from "../components/ExportSVG.vue";
import OptionsForm from "../components/forms/Options.vue";
import GridForm from "../components/forms/GridForm.vue";
import Layout from "../layouts/Main.vue";
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
.paper {
  margin: 20px;
}
</style>
