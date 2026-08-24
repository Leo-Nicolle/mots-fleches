<template>
  <Layout v-if="style && solutionsStyle"
    :breadcrumbs="isBook ? [{ text: $t('nav.books'), to: '/books' }, { text: book!.title }] : [{ text: $t('nav.grids') }]"
    :eltList="displayedGrids"
    :onCreate="canWrite ? openNewGrid : undefined"
    :onDelete="onDelete"
    :getLink="(grid) => `/grid/${grid.id}/${style.id}`"
    @select="(s) => (selected = s)"
    :has-create-button="canWrite"
    :has-delete-button="canWrite">
    <template v-slot:left-panel>
      <n-alert v-if="!isBook && api.mode === 'idb' && grids.length >= 2 && showSyncPrompt"
        :title="$t('account.syncCta')" type="info" closable :on-close="dismissSyncPrompt">
        <n-button size="small" type="primary" @click="router.push('/register')">
          {{ $t("login.register") }}
        </n-button>
      </n-alert>
      <BookButtons v-if="isBook && book" :style="style" :solutionsStyle="solutionsStyle" :selected="selectedIds"
        v-model="book" @update="fetch" />
      <h3>{{ $t("nav.grids") }}</h3>
      <GroupFilter
        v-if="!isBook && api.mode === 'remote' && myGroups.length > 0"
        v-model="activeGroupId"
        :groups="myGroups"
        :resource-label="$t('nav.grids')"
      />
      <GridCopyModal :isBook="isBook" :gridIds="selectedIds" />
      <ExportButton route="book-export" :query="exportQuery" />
      <ExportModal :grids="selected.length ? selected : displayedGrids" :style="style" :solutionsStyle="solutionsStyle" />
      <n-button round @click="download"> {{ $t('buttons.download') }} </n-button>
      <UploadModal v-if="canWrite" :title="$t('buttons.uploadGrids')" :buttonText="$t('buttons.uploadGrids')" @ok="onUpload" />
      <ImportGridModal v-if="isDev && !isBook" @imported="fetch" />
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
  <NewGridModal v-model:show="newGridVisible" @create="createGrid" />
  <Teleport to="#outside">
    <div>
      <GridThumbnail v-if="style && displayedGrids" :grids="displayedGrids" :style="style" v-model="thumbnails" />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import GridThumbnail from "../components/svg-renderer/GridThumbnail.vue";
import ExportModal from "../components/modals/ExportModal.vue";
import ExportButton from "../components/ExportButton.vue";
import GridModal from "../components/modals/GridModal.vue";
import Layout from "../layouts/GridLayout.vue";
import UploadModal from "../components/modals/UploadModal.vue";
import ImportGridModal from "../components/modals/ImportGridModal.vue";
import NewGridModal from "../components/modals/NewGridModal.vue";
import GroupFilter from "../components/GroupFilter.vue";
import { Grid, GridState, GridStyle, SolutionStyle } from "grid";
import generate from "../js/maze-generator";
import { api } from "../api";
import { workerController } from "../worker";
import BookButtons from "../components/sidebars/BookButtons.vue";
import GridCopyModal from "../components/modals/GridCopyModal.vue";
import { Book } from "database";
import type { GroupSummary } from "database";
import { postEvent } from "../js/telemetry";
import { useI18n } from "vue-i18n";

/**
 * View to display all grids in a grid layout
 */
const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const grids = ref<Grid[]>([]);
const groupGrids = ref<Grid[]>([]);
const myGroups = ref<GroupSummary[]>([]);
const activeGroupId = ref<number | null>(null);
const book = ref<Book | undefined>(undefined);
const style = ref<GridStyle>();
const solutionsStyle = ref<SolutionStyle>();
const selected = ref<Grid[]>([]);
const thumbnails = ref<string[]>([]);
const newGridVisible = ref(false);
const showSyncPrompt = ref(!localStorage.getItem("motsflex-sync-prompt-dismissed"));
function dismissSyncPrompt() {
  showSyncPrompt.value = false;
  localStorage.setItem("motsflex-sync-prompt-dismissed", "1");
}

const isDev = import.meta.env.DEV;
const isBook = computed(() => route.name === "book");
const bookOwnedByMe = ref(true); // default true; set false for shared books
const bookGroupId = ref<number | null>(null);
const canWrite = computed(() => !isBook.value ? activeGroupId.value === null : bookOwnedByMe.value);
const selectedIds = computed(() => selected.value.map((s) => s.id));
const displayedGrids = computed(() =>
  activeGroupId.value === null ? grids.value : groupGrids.value
);
const exportQuery = computed(() => {
  const ids = (selected.value.length ? selected.value : displayedGrids.value)
    .map((g) => g.id)
    .join(",");
  const styleId = book.value ? book.value.style : "default";
  const solution = book.value ? book.value.solutionStyle : "solution";
  return { ids, style: styleId, solution };
});

async function fetchMyGroups() {
  if (api.mode !== "remote") return;
  try {
    const { data } = await api.remote.fetcher.get("/groups");
    myGroups.value = data;
  } catch (e) {
    console.error(e);
  }
}

async function fetchGroupGrids(groupId: number) {
  try {
    const raw = await api.remote.getGroupGrids(groupId);
    groupGrids.value = raw.map((g) => Grid.unserialize(g)).sort((a, b) => b.created - a.created);
    thumbnails.value = [];
  } catch (e) {
    console.error(e);
  }
}

watch(activeGroupId, (id) => {
  if (id !== null) fetchGroupGrids(id);
  else groupGrids.value = [];
});

function fetch() {
  if (isBook.value) {
    const bookId = route.params.id as string;
    const ownershipPromise = api.mode === 'remote'
      ? (api.remote.fetcher as any).get(`/book/${bookId}/ownership`)
          .then((res: any) => {
            bookOwnedByMe.value = res.data.owned;
            bookGroupId.value = res.data.group_id ?? null;
          })
          .catch(() => { bookOwnedByMe.value = false; })
      : Promise.resolve();

    return Promise.all([api.db.getBook(bookId), ownershipPromise])
      .then(([mbook]) => {
        book.value = mbook;
        const groupId = bookGroupId.value;
        const getStyle = (id: string) =>
          !bookOwnedByMe.value && groupId && api.mode === 'remote'
            ? api.remote.getGroupStyle(groupId, id)
            : api.db.getStyle(id);
        return Promise.all([
          Promise.all(mbook!.grids.map((id) => api.db.getGrid(id))),
          getStyle(mbook!.style),
          getStyle(mbook!.solutionStyle),
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
      .catch((e) => console.error("E", e));
  }

  return api
    .getGrids()
    .then((gs) => {
      grids.value = gs.sort((a, b) => b.created - a.created);
    })
    .then(() => Promise.all([api.db.getStyle("default"), api.db.getStyle("solution")]))
    .then((opts) => {
      style.value = opts[0] as GridStyle;
      solutionsStyle.value = opts[1] as SolutionStyle;
      thumbnails.value = [];
    })
    .catch((e) => console.error("E", e));
}

function onDelete() {
  postEvent("delete-grid");
  const ids = selected.value.map((grid) => grid.id);
  return api.deleteGrids(ids).then(() => fetch());
}

function download() {
  postEvent("download-grids");
  const toDl = selected.value.length ? selected.value : displayedGrids.value;
  const a = document.createElement("a");
  const file = new Blob([JSON.stringify(toDl)], { type: "text/plain" });
  a.href = URL.createObjectURL(file);
  a.download = "grids.json";
  a.click();
}

function onUpload(filesContents: [string, string][]) {
  postEvent("upload-grids");
  return Promise.all(
    filesContents.map(([, json]) =>
      Promise.all((JSON.parse(json) as GridState[]).map((grid) => api.db.pushGrid(grid)))
    )
  ).then(() => fetch());
}

function openNewGrid() {
  newGridVisible.value = true;
}

function createGrid(rows: number, cols: number, title?: string) {
  postEvent("create-grid");
  const newGrid = new Grid(rows, cols);
  newGrid.title = title?.trim() || t("buttons.newGrid");
  workerController
    .getDistribution()
    .then((distribution) => {
      generate({ grid: newGrid, distribution });
    })
    .then(() => api.db.pushGrid(newGrid))
    .then((gridId) => {
      if (isBook.value) {
        return api.pushGridToBook(route.params.id as string, gridId);
      }
    })
    .then(() => fetch());
}

onMounted(async () => {
  await fetchMyGroups();
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
