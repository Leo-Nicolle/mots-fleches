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
      <h3>Grilles</h3>
      <ExportButton route="book-export" :params="params" />
      <!-- <n-button @click="onExportClick">Exporter</n-button> -->
    </template>
    <template #card-title="{ elt }">
      <span>
        {{ elt.title ? elt.title : `Nouvelle Grille` }}
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
      {{ elt.comment ? elt.comment : "Nouvelle Grille" }}
    </template>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import SVGGrid from "../components/svg-renderer/Grid.vue";
import ExportButton from "../components/ExportButton.vue";
import Layout from "../layouts/GridLayout.vue";
import { defaultExportOptions } from "../types";
import { getUrl } from "../js/utils";
import { Grid, GridOptions, nullCell } from "grid";
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
  return axios
    .get(getUrl("grid"))
    .then(({ data }) => {
      grids.value = data.map((g) => Grid.unserialize(JSON.stringify(g)));
    })
    .then(() =>
      Promise.all(
        grids.value.map((grid) =>
          axios.get(getUrl(`options/${grid.optionsId}`))
        )
      )
    )
    .then((responses) => {
      options.value = responses.map((r) => r.data);
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
  Promise.all(
    selected.value.map((grid) => axios.delete(getUrl(`grid/${grid.id}`)))
  ).then(() => fetch());
}

function createGrid() {
  const newGrid = new Grid(10, 10);
  newGrid.title = "Nouvelle Grille";
  return axios
    .post(getUrl("grid"), { grid: newGrid.serialize() })
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

