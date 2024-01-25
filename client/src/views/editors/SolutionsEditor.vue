<template>
  <Layout>
    <template #left-panel v-if="grids.length && style">
      <OptionsForm v-model="style" @update:modelValue="save" grid format>
        <SolutionsForm v-model="style" @update:modelValue="save" />
      </OptionsForm>
    </template>
    <template #body>
      <!-- <WordsIndex :grids="grids" v-if="grids.length && style" class="paper"
        @page-count="solutionFirstPage = $event + indexFirstPage" :export-options="exportOptions" :solutionStyle="style"
        :page="indexFirstPage" /> -->
      <NoGrid v-else />
      <SolutionsPaper :grids="grids" v-if="grids.length && style" class="paper" :solutionStyle="style"
        :export-options="exportOptions" :page="solutionFirstPage" />
    </template>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted, toRaw } from "vue";
import { useRoute } from "vue-router";
import Layout from "../../layouts/Main.vue";
import OptionsForm from "../../components/forms/GridStyleForm.vue";
import SolutionsPaper from "../../components/Solutions.vue";
import WordsIndex from "../../components/WordsIndex.vue";
import SolutionsForm from "../../components/forms/SolutionsStyleForm.vue";
import NoGrid from "../../components/NoGrid.vue";

import { Grid, SolutionStyle } from "grid";
import { defaultExportOptions, ExportOptions } from "../../types";
import { api } from "../../api";
/**
 * View to edit solutions options
 */

const route = useRoute();
const grids = ref<Grid[]>([]);
const style = ref<SolutionStyle>();
const exportOptions = ref<ExportOptions>({
  ...defaultExportOptions,
  arrows: false,
  definitions: false,
  spaces: false,
  splits: false,
});
const indexFirstPage = ref(0);
const solutionFirstPage = ref(0);
const saveTimeout = ref(0);
function fetch() {
  const promise = route.query.ids
    ? Promise.all(
      (route.query.ids as string).split(",").map((id) => api.getGrid(id))
    ).then((gs) => {
      grids.value = gs.filter((e) => e) as Grid[];
    })
    : api.getGrids().then((gs) => {
      grids.value = gs;
    });
  return promise
    .then(() => api.db.getStyle("solution"))
    .then((s) => {
      style.value = s as SolutionStyle;
      indexFirstPage.value =
        grids.value.length + +style.value.pagination.startIdx;
    })
    .catch((e) => {
      console.error("E", e);
    });
}

function save() {
  clearTimeout(saveTimeout.value);
  saveTimeout.value = +setTimeout(() => {
    if (!style.value) return;
    api.db.pushStyle(toRaw(style.value) as unknown as SolutionStyle);
  }, 100);
}

onMounted(() => {
  fetch();
});
</script>

<style scoped>
.paper {
  margin: 20px;
}
</style>

