<template>
  <Layout
    v-if="style && solutionsStyle"
    :eltList="grids"
    :onCreate="createGrid"
    :onDelete="onDelete"
    :onClick="(grid) => $router.push(`/grid/${grid.id}`)"
    @select="(s) => (selected = s)"
    :has-create-button="true"
    :has-delete-button="true"
  >
    <template v-slot:left-panel>
      <h3>{{ $t("nav.grids") }}</h3>
      <ExportButton route="book-export" :query="exportQuery" />
      <ExportModal
        :grids="selected.length ? selected : grids"
        :style="style"
        :solutionsStyle="solutionsStyle"
      />
      <n-button round @click="download"> {{ $t('buttons.download') }} </n-button>
      <UploadModal
        :title="$t('buttons.uploadGrids')"
        :buttonText="$t('buttons.uploadGrids')"
        @ok="onUpload"
      />
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
          :style="style"
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
import ExportModal from "../components/ExportModal.vue";
import Layout from "../layouts/GridLayout.vue";
import UploadModal from "../components/UploadModal.vue";
import { defaultExportOptions } from "../types";
import { Grid, GridStyle, nullCell, SolutionStyle } from "grid";
import generate from "../js/maze-generator";
import { api } from "../api";
import { workerController } from "../search-worker";
/**
 * View to display all grids in a grid layout
 */
const router = useRouter();
const grids = ref<Grid[]>([]);
const style = ref<GridStyle>();
const solutionsStyle = ref<SolutionStyle>();

const selected = ref<Grid[]>([]);

const exportQuery = computed(() => {
  return { ids: selected.value.map((s) => s.id).join(",") };
});
function fetch() {
  return api
    .getGrids()
    .then((gs) => {
      grids.value = gs;
    })
    .then(() =>
      Promise.all([api.db.getStyle("default"), api.db.getStyle("solution")])
    )
    .then((opts) => {
      style.value = opts[0] as GridStyle;
      solutionsStyle.value = opts[1] as SolutionStyle;
    })
    .catch((e) => {
      console.error("E", e);
    });
}

function onDelete() {
  return Promise.all(
    selected.value.map((grid) => api.db.deleteGrid(grid.id))
  ).then(() => fetch());
}
function download() {
  const toDl = selected.value.length ? selected.value : grids.value;
  const a = document.createElement("a");
  const file = new Blob([JSON.stringify(toDl)], { type: "text/plain" });
  a.href = URL.createObjectURL(file);
  a.download = "grids.json";
  a.click();
}

function onUpload(filesContents: string[]) {
  return Promise.all(
    filesContents.map((json) => {
      return Promise.all(
        JSON.parse(json).map((grid) =>
          api.db.pushGrid(Grid.unserialize(JSON.stringify(grid)))
        )
      );
    })
  ).then(() => fetch());
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

