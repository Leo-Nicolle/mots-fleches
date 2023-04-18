<template>
  <Layout v-if="grids.length && options">
    <template #left-panel>
      <OptionsForm v-model="options" @update:modelValue="onUpdate" grid format>
        <SolutionsForm v-model="options" @update:modelValue="onUpdateM" />
      </OptionsForm>
    </template>
    <template #body>
      <SolutionsPaper
        :grids="grids"
        :solutionOptions="options"
        class="paper"
        :export-options="exportOptions"
      />
      <WordsIndex
        :grids="grids"
        class="paper"
        :export-options="exportOptions"
        :solutionOptions="options"
      />
    </template>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import Layout from "../layouts/Main.vue";
import ExportButton from "../components/ExportButton.vue";
import OptionsForm from "../components/forms/Options.vue";
import SolutionsPaper from "../components/Solutions.vue";
import WordsIndex from "../components/WordsIndex.vue";

import SolutionsForm from "../components/forms/SolutionsForm.vue";

import { getUrl, save } from "../js/utils";
import { Grid, SolutionOptions } from "grid";
import { defaultExportOptions, ExportOptions } from "../types";
/**
 * View to edit solutions options
 */

const route = useRoute();
const grids = ref<Grid[]>([]);
const options = ref<SolutionOptions>();
const exportOptions = ref<ExportOptions>({
  ...defaultExportOptions,
  arrows: false,
  definitions: false,
  spaces: false,
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
</style>

