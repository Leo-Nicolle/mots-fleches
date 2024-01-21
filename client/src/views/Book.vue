<template>
  <Layout v-if="style && solutionsStyle" :eltList="grids" :onCreate="createGrid" :onDelete="onDelete"
    :onClick="(grid) => $router.push(`/grid/${grid.id}`)" @select="(s) => (selected = s)" :has-create-button="true"
    :has-delete-button="true">
    <template v-slot:left-panel>
      <div v-if="route.name === 'book'">
        <h3>{{ $t("nav.book") }}</h3>
        <BookModal :bookId="route.hash" :style="style" :solutionsStyle="solutionsStyle" />
      </div>
      <h3>{{ $t("nav.grids") }}</h3>
      <ExportButton route="book-export" :query="exportQuery" />
      <ExportModal :grids="selected.length ? selected : grids" :style="style" :solutionsStyle="solutionsStyle" />
      <n-button round @click="download"> {{ $t('buttons.download') }} </n-button>
      <UploadModal :title="$t('buttons.uploadGrids')" :buttonText="$t('buttons.uploadGrids')" @ok="onUpload" />
    </template>
    <template #card-title="{ elt }">
      <span>
        {{ elt.title ? elt.title : $t("buttons.newGrid") }}
      </span>
    </template>
    <template #card-body="{ elt, i }">
      <a class="preview" :href="`#/grid/${elt.id}`">
        <img :src="thumbnails[i] || '/placeholder.png'" />
        {{ thumbnails[i] }}
      </a>
      {{ elt.comment ? elt.comment : $t("buttons.newGrid") }}
    </template>
    <template v-slot:outside>
      <GridThumbnail v-if="grids[exportingG]" :grid="grids[exportingG]" :style="style" @update="onExported" />
    </template>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import GridThumbnail from "../components/svg-renderer/GridThumbnail.vue";
import ExportModal from "../components/ExportModal.vue";
import BookModal from "../components/BookModal.vue";
import ExportButton from "../components/ExportButton.vue";
import Layout from "../layouts/GridLayout.vue";
import UploadModal from "../components/UploadModal.vue";
import { Grid, GridState, GridStyle, SolutionStyle } from "grid";
import generate from "../js/maze-generator";
import { api } from "../api";
import { workerController } from "../worker";
/**
 * View to display all grids in a grid layout
 */
const router = useRouter();
const route = useRoute();

const grids = ref<Grid[]>([]);
const style = ref<GridStyle>();
const solutionsStyle = ref<SolutionStyle>();
const selected = ref<Grid[]>([]);
const exporting = ref(false);
const exportingG = ref<number>(0);
const thumbnails = ref<string[]>([]);
const exportQuery = computed(() => {
  return { ids: selected.value.map((s) => s.id).join(",") };
});
function fetch() {
  if (route.name === 'book') {
    return api
      .db.getBook(route.params.id as string)
      .then((book) => Promise.all([
        Promise.all(book!.grids.map(id => api.db.getGrid(id))),
        api.db.getStyle(book!.style),
        api.db.getStyle(book!.solutionStyle)
      ]))
      .then(([gds, sts, sls]) => {
        grids.value = (gds as GridState[])
          .map((g) => Grid.unserialize(JSON.stringify(g)))
          .sort((a, b) => b.created - a.created);
        style.value = sts!;
        solutionsStyle.value = sls as SolutionStyle;
        exporting.value = true;
        exportingG.value = 0;
        thumbnails.value = [];
      })
      .catch((e) => {
        console.error("E", e);
      });
  }

  return api
    .getGrids()
    .then((gs) => {
      grids.value = gs.sort((a, b) => b.created - a.created);
    })
    .then(() =>
      Promise.all([api.db.getStyle("default"), api.db.getStyle("solution")])
    )
    .then((opts) => {
      style.value = opts[0] as GridStyle;
      solutionsStyle.value = opts[1] as SolutionStyle;
      exporting.value = true;
      exportingG.value = 0;
      thumbnails.value = [];
    })
    .catch((e) => {
      console.error("E", e);
    });
}

function onExported(str: string) {
  thumbnails.value.push(str);
  exportingG.value = exportingG.value + 1;
}

function onDelete() {
  const ids = selected.value.map((grid) => grid.id);
  const promise = route.name === 'book'
    ? api.deleteGridsFromBook(route.params.id as string, ids)
    : Promise.resolve();
  return promise
    .then(() => Promise.all(
      ids.map((id) => api.db.deleteGrid(id)))
    )
    .then(() => fetch());
}
function download() {
  const toDl = selected.value.length ? selected.value : grids.value;
  const a = document.createElement("a");
  const file = new Blob([JSON.stringify(toDl)], { type: "text/plain" });
  a.href = URL.createObjectURL(file);
  a.download = "grids.json";
  a.click();
}

function onUpload(filesContents: [string, string][]) {
  return Promise.all(
    filesContents.map(([filename, json]) => {
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
    .then(gridId => {
      if (route.name === 'book') {
        return api.pushGridToBook(route.params.id as string, gridId);
      }
    })
    .then(() => fetch());
}

onMounted(() => {
  api.getUserDefinitions()
    .then(defs => { });
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

.card-body>svg {
  max-width: 340px;
  max-height: 340px;
}
</style>