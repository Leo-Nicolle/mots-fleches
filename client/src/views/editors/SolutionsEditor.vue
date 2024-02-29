<template>
  <Layout>
    <template #left-panel>
      <OptionsForm v-if="style" v-model="style" grid format>
        <SolutionsForm v-model="style" />
      </OptionsForm>
    </template>
    <template #body>
      <Loading v-if="loading" />
      <WordsIndex :grids="grids" v-else-if="grids.length && style" class="paper"
        @page-count="solutionFirstPage = $event + indexFirstPage" :export-options="exportOptions" :solutionStyle="style"
        :page="indexFirstPage" />
      <NoGrid v-else />
      <SolutionsPaper :grids="grids" v-if="grids.length && style" class="paper" :solutionStyle="style"
        :export-options="exportOptions" :page="solutionFirstPage" />
    </template>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted, toRaw, watch } from "vue";
import { useRoute } from "vue-router";
import Layout from "../../layouts/Main.vue";
import OptionsForm from "../../components/forms/GridStyleForm.vue";
import Loading from '../../components/Loading.vue';
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
const loading = ref(true);
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
  loading.value = true;
  const id = route.params.id as string || 'solution';
  const bookId = route.params.bookId as string | undefined;
  const promise = bookId && bookId !== 'none'
    ? api.getBookGrids(bookId)
      .then((gs) => {
        grids.value = gs.filter((e) => e) as Grid[];
      })
    : api.getGrids().then((gs) => {
      grids.value = gs;
    });
  return promise
    .then(() => api.db.getStyle(id))
    .then((s) => {
      style.value = s as SolutionStyle;
      indexFirstPage.value =
        grids.value.length + +style.value.pagination.startIdx;
    })
    .catch((e) => {
      console.error("E", e);
    })
    .finally(() => {
      loading.value = false;
    });
}

function save() {
  clearTimeout(saveTimeout.value);
  saveTimeout.value = +setTimeout(() => {
    if (!style.value) return;
    api.db.pushStyle(toRaw(style.value) as unknown as SolutionStyle);
  }, 100);
}
watch(style, save, { deep: true });

onMounted(() => {
  fetch();
});
</script>

<style scoped>
.paper {
  margin: 20px;
}
</style>

