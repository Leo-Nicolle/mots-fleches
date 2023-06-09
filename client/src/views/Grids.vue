<template>
  <Layout
    v-if="options.length === grids.length"
    :eltList="grids"
    :onCreate="createGrid"
    :onDelete="onDelete"
    :onClick="(grid) => $router.push(`/grid/${grid.id}`)"
    @select="(s) => (selected = s)"
  >
    <template v-slot:left-panel>
      <h3>{{ $t("nav.grids") }}</h3>
      <ExportButton route="book-export" :params="params" />
    </template>
    <template #card-title="{ elt }">
      <span>
        {{ elt.title ? elt.title : $t("buttons.newGrid") }}
      </span>
    </template>
    <template #card-body="{ elt, i }">
      <div class="preview">
        <SVGGrid
          :grid="elt"
          :focus="nullCell"
          :options="options[i]"
          dir="horizontal"
          :export-options="{
            ...defaultExportOptions,
            texts: true,
            highlight: true,
          }"
        ></SVGGrid>
      </div>
      {{ elt.comment ? elt.comment : $t("buttons.newGrid") }}
    </template>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import SVGGrid from "../components/svg-renderer/Grid.vue";
import ExportButton from "../components/ExportButton.vue";
import Layout from "../layouts/GridLayout.vue";
import { defaultExportOptions } from "../types";
import { Grid, GridOptions, nullCell } from "grid";
import generate from "../js/maze-generator";
import { api } from "../api";
import { workerController } from "../search-worker";
/**
 * View to display all grids in a grid layout
 */
const router = useRouter();
const grids = ref<Grid[]>([]);
const options = ref<GridOptions[]>([]);
const selected = ref<Grid[]>([]);

const params = computed(() => {
  return { ids: selected.value.map((s) => s.id).join(",") };
});
function fetch() {
  return api
    .getGrids()
    .then((gs) => {
      grids.value = gs;
    })
    .then(() =>
      Promise.all(grids.value.map((grid) => api.db.getOption(grid.optionsId)))
    )
    .then((opts) => {
      options.value = opts as GridOptions[];
    })
    .catch((e) => {
      console.error("E", e);
    });
}

function onExportClick() {
  router.push({
    path: "solutions",
    query: { ids: selected.value.map(({ id }) => id).join(",") },
  });
}
function onDelete() {
  Promise.all(selected.value.map((grid) => api.db.deleteGrid(grid.id))).then(
    () => fetch()
  );
}

function createGrid() {
  const newGrid = new Grid(10, 10);
  newGrid.title = "Nouvelle Grille";
  workerController
    .getDistribution()
    .then((distribution) => {
      generate({ grid: newGrid, distribution });
    })
    .then(() => api.db.pushGrid(newGrid))
    .then(() => fetch());
}

onMounted(() => {
  fetch();
});
</script>

<style scoped>
.preview {
  width: 170px;
  height: 170px;
  max-width: 170px;
  max-height: 170px;
  overflow: hidden;
}
.card-body {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.card-body > svg {
  max-width: 340px;
  max-height: 340px;
}
</style>

