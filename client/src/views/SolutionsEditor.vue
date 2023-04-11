<template>
  <div class="solutions" v-if="grids.length && options">
    <div class="leftpanel">
      <n-scrollbar y-scrollable style="max-height: calc(100vh - 100px)">
        <OptionsForm
          v-model="options"
          @update:modelValue="onUpdate"
          grid
          format
        >
          <SolutionsForm v-model="solutionsOptions" @update:modelValue="onUpdateM"/>
        </OptionsForm>
      </n-scrollbar>
    </div>
    <div class="viewer">
      <n-scrollbar
        x-scrollable
        style="max-height: calc(100vh - 100px); max-width: calc(100vw - 100px)"
        >
        <WordsIndex
          :grids="grids"
          :options="options"
          class="paper"
          :export-options="exportOptions"
          :solutions-options="solutionsOptions"
        />
        <SolutionsPaper
          :grids="grids"
          :options="options"
          class="paper"
          :export-options="exportOptions"
          :solutions-options="solutionsOptions"
        />
      </n-scrollbar>
    </div>
    <ExportButton route="index-export" />

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import axios from "axios";
import ExportButton from "../components/ExportButton.vue";
import OptionsForm from "../components/forms/Options.vue";
import SolutionsPaper from "../components/Solutions.vue";
import WordsIndex from "../components/WordsIndex.vue";

import SolutionsForm from "../components/forms/SolutionsForm.vue";

import { getUrl, save } from "../js/utils";
import { getAllWords, Grid, GridOptions, nullCell } from "grid";
import {
  defaultExportOptions,
  defaultSolutionOptions,
  ExportOptions,
  SolutionOptions,
} from "../components/svg-renderer/types";
const router = useRouter();
const grids = ref<Grid[]>([]);
const options = ref<GridOptions>();
const solutionsOptions = ref<SolutionOptions>(defaultSolutionOptions);
const exportOptions = ref<ExportOptions>({
  ...defaultExportOptions,
  arrows: false,
  definitions: false,
});

function fetch() {
  return axios
    .get(getUrl("grid"))
    .then(({ data }) => {
      console.log("data", data);
      grids.value = data.map((g) => Grid.unserialize(JSON.stringify(g)));
    })
    .then(() => axios.get(getUrl(`options/defaultExport`)))
    .then(({ data }) => {
      options.value = data;
      console.log(options.value, grids.value);
    })
    .catch((e) => {
      console.error("E", e);
    });
}

function onUpdate() {}
function onUpdateM() {
  console.log("updateM", solutionsOptions.value.grids.rows);
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

