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
          <SolutionsForm v-model="options" @update:modelValue="onUpdateM" />
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
          class="paper"
          :export-options="exportOptions"
          :solutionOptions="options"
        />
        <SolutionsPaper
          :grids="grids"
          :solutionOptions="options"
          class="paper"
          :export-options="exportOptions"
        />
      </n-scrollbar>
    </div>
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
import {
  getAllWords,
  Grid,
  GridOptions,
  nullCell,
  SolutionOptions,
} from "grid";
import {
  defaultExportOptions,
  ExportOptions,
} from "../components/svg-renderer/types";
const route = useRoute();

const grids = ref<Grid[]>([]);
const options = ref<SolutionOptions>();
const exportOptions = ref<ExportOptions>({
  ...defaultExportOptions,
  arrows: false,
  definitions: false,
});

function fetch() {
  const promise = route.query.ids
    ? Promise.all(
        (route.query.ids as string)
          .split(",")
          .map((id) => axios.get(getUrl(`grid/${id}`)).then(({ data }) => data))
      ).then((data) => {
        grids.value = data.map((g) => Grid.unserialize(JSON.stringify(g)));
      })
    : axios.get(getUrl("grid")).then(({ data }) => {
        grids.value = data.map((g) => Grid.unserialize(JSON.stringify(g)));
      });
  return promise
    .then(() => axios.get(getUrl(`options/solution`)))
    .then(({ data }) => {
      options.value = data;
      console.log(options.value, grids.value);
    })
    .catch((e) => {
      console.error("E", e);
    });
}

function onUpdate() {}
function onUpdateM() {}
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

