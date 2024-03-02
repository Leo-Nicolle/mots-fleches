<template>
  <Layout v-if="style && solutionsStyle" :eltList="grids" :onCreate="createGrid" :onDelete="onDelete"
    :getLink="(grid) => `/grid/${grid.id}`" @select="(s) => (selected = s)" :has-create-button="true"
    :has-delete-button="true">
    <template v-slot:left-panel>
      <BookButtons v-if="isBook && book" :style="style" :solutionsStyle="solutionsStyle" :selected="selectedIds"
        v-model="book" @update="fetch" />
      <h3>{{ $t("nav.grids") }}</h3>
      <GridCopyModal :isBook="isBook" :gridIds="selectedIds" />
      <ExportButton route="book-export" :query="exportQuery" />
      <ExportModal :grids="selected.length ? selected : grids" :style="style" :solutionsStyle="solutionsStyle" />
      <n-button round @click="download"> {{ $t('buttons.download') }} </n-button>
      <UploadModal :title="$t('buttons.uploadGrids')" :buttonText="$t('buttons.uploadGrids')" @ok="onUpload" />
    </template>
    <template #card-title="{ elt }">
      <GridModal v-model:grid="(elt as Grid)" />
      <span>
        {{ elt.title ? elt.title : $t("buttons.newGrid") }}
      </span>
    </template>
    <template #card-body="{ elt, i }">
      <div class="preview">
        <span v-if="thumbnails[i]" v-html="thumbnails[i]"></span>
        <img v-else src="/placeholder.png" />
      </div>
    </template>
  </Layout>
  <Teleport to="#outside">
    <div>
      <GridThumbnail v-if="style && grids" :grids="grids" :style="style" v-model="thumbnails" />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import GridThumbnail from "../components/svg-renderer/GridThumbnail.vue";
import ExportModal from "../components/modals/ExportModal.vue";
import ExportButton from "../components/ExportButton.vue";
import GridModal from "../components/modals/GridModal.vue";
import Layout from "../layouts/GridLayout.vue";
import UploadModal from "../components/modals/UploadModal.vue";
import { Grid, GridState, GridStyle, SolutionStyle } from "grid";
import generate from "../js/maze-generator";
import { api } from "../api";
import { workerController } from "../worker";
import BookButtons from "../components/sidebars/BookButtons.vue";
import GridCopyModal from "../components/modals/GridCopyModal.vue";
import { Book } from "database";
/**
 * View to display all grids in a grid layout
 */
const route = useRoute();
const grids = ref<Grid[]>([]);
const book = ref<Book | undefined>(undefined);
const style = ref<GridStyle>();
const solutionsStyle = ref<SolutionStyle>();
const selected = ref<Grid[]>([]);
const thumbnails = ref<string[]>([]);
const exportQuery = computed(() => {
  const res = { ids: selected.value.map((s) => s.id).join(",") };
  return res;
});
const isBook = computed(() => route.name === 'book');
const selectedIds = computed(() => selected.value.map(s => s.id));
function fetch() {
  if (isBook.value) {
    return api
      .db.getBook(route.params.id as string)
      .then((mbook) => {
        book.value = mbook;
        return Promise.all([
          Promise.all(mbook!.grids.map(id => api.db.getGrid(id))),
          api.db.getStyle(mbook!.style),
          api.db.getStyle(mbook!.solutionStyle)
        ]);
      })
      .then(([gds, sts, sls]) => {
        grids.value = (gds as GridState[])
          .map((g) => Grid.unserialize(g))
          .sort((a, b) => b.created - a.created);
        style.value = sts!;
        solutionsStyle.value = sls as SolutionStyle;
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
      thumbnails.value = [];
    })
    .catch((e) => {
      console.error("E", e);
    });
}

function onDelete() {
  const ids = selected.value.map((grid) => grid.id);
  return api.deleteGrids(ids)
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
        (JSON.parse(json) as GridState[]).map((grid) =>
          api.db.pushGrid(grid)
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
      if (isBook.value) {
        return api.pushGridToBook(route.params.id as string, gridId);
      }
    })
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

.card-body>svg {
  max-width: 340px;
  max-height: 340px;
}
</style>