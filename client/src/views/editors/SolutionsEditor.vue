<template>
  <Layout v-if="grids.length && options">
    <template #left-panel>
      <OptionsForm v-model="options" @update:modelValue="save" grid format>
        <SolutionsForm v-model="options" @update:modelValue="save" />
      </OptionsForm>
    </template>
    <template #body>
      <WordsIndex
        :grids="grids"
        class="paper"
        @page-count="solutionFirstPage = $event + indexFirstPage"
        :export-options="exportOptions"
        :solutionOptions="options"
        :page="indexFirstPage"
      />
      <SolutionsPaper
        :grids="grids"
        class="paper"
        :solutionOptions="options"
        :export-options="exportOptions"
        :page="solutionFirstPage"
      />
    </template>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted, toRaw } from "vue";
import { useRoute } from "vue-router";
import Layout from "../../layouts/Main.vue";
import OptionsForm from "../../components/forms/Options.vue";
import SolutionsPaper from "../../components/Solutions.vue";
import WordsIndex from "../../components/WordsIndex.vue";
import SolutionsForm from "../../components/forms/SolutionsForm.vue";
import { Grid, SolutionOptions } from "grid";
import { defaultExportOptions, ExportOptions } from "../../types";
import { api } from "../../api";
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
    .then(() => api.db.getOption("solution"))
    .then((opts) => {
      console.log(opts);
      options.value = opts as SolutionOptions;
      indexFirstPage.value =
        grids.value.length + +options.value.pagination.startIdx;
    })
    .catch((e) => {
      console.error("E", e);
    });
}

function save() {
  clearTimeout(saveTimeout.value);
  saveTimeout.value = +setTimeout(() => {
    if (!options.value) return;
    api.db.pushOption(toRaw(options.value) as unknown as SolutionOptions);
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

