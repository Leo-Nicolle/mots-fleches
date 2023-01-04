<template>
  <div class="grids">
    <div v-if="!exporting">
      <div class="leftpanel">
        <h3>Grilles</h3>
        <n-button @click="onExportClick">Exporter</n-button>
        <n-button @click="deleteVisible = true" type="warning"
          >Supprimer</n-button
        >
      </div>
      <div class="wrapper scroll">
        <div>
          <n-card v-for="(grid, i) in grids" :key="i" :hoverable="true">
            <template #header>
              <span class="card-title">
                <span>
                  {{ grid.title ? grid.title : `Nouvelle Grille` }}
                </span>
                <n-checkbox
                  @click="
                    (evt) => {
                      evt.preventDefault();
                      evt.stopPropagation();
                    }
                  "
                  v-model:checked="selected[i]"
                >
                </n-checkbox>
              </span>
            </template>

            <template #default>
              <div @click="$router.push(`/grid/${grid.id}`)">
                <button
                  v-if="!grid.thumbnail && (active !== grid || !shouldExport)"
                  class="thumbnail add"
                  grid.thumbnail
                >
                  <n-icon>
                    <HeartOutline />
                  </n-icon>
                </button>
                <img
                  v-else-if="active !== grid || !shouldExport"
                  class="thumbnail"
                  :src="grid.thumbnail"
                />
                <n-button
                  v-else
                  class="thumbnail"
                  :loading="true"
                  icon-placement="center"
                >
                </n-button>
                {{ grid.comment ? grid.comment : "Nouvelle Grille" }}
              </div>
            </template>
          </n-card>
          <n-card @click="createGrid" title="Créer">
            <template #cover>
              <n-button class="thumbnail add">
                <n-icon>
                  <AddIcon />
                </n-icon>
              </n-button>
            </template>
          </n-card>
        </div>
        <Exporter
          v-if="active"
          :grid="active"
          :shouldExport="shouldExport"
          :arrows="false"
          :separators="false"
          :texts="true"
          :definitions="false"
          :options="options"
          @exported="onExported"
        />

        <n-modal
          preset="dialog"
          title="Supprimer ?"
          :showIcon="false"
          v-model:show="deleteVisible"
        >
          <template #action>
            <n-button @click="deleteVisible = false">Non</n-button>
            <n-button @click="onDelete" type="warning">Oui</n-button>
          </template>
        </n-modal>
      </div>
    </div>
    <Exporting v-else :grids="selectedGrids" :options="options" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import axios from "axios";
import { AddCircleOutline as AddIcon, HeartOutline } from "@vicons/ionicons5";

import { getUrl, save } from "../js/utils";
import Exporter from "../components/Exporter.vue";
import Exporting from "./Exporting.vue";

import { Grid, GridOptions } from "../grid";
const router = useRouter();
const options = ref<GridOptions>({
  grid: {
    cellSize: "56px",
    borderColor: "black",
    borderSize: "1px",
  },
  definition: {
    font: "sans-serif",
    size: "12px",
    color: "black",
  },
  arrow: {
    size: "2em",
    color: "black",
  },
  paper: {
    width: 21,
    height: 29.7,
    orientation: "portrait",
    dpi: 300,
    margin: {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    },
  },
});

const grids = ref<Grid[]>([]);
const selected = ref<boolean[]>([]);
const deleteVisible = ref<boolean>(false);
const active = ref<Grid>();
const exporting = ref(false);
const shouldExport = ref(false);

const selectedGrids = computed(
  () =>
    selected.value
      .map((s, i) => (s ? grids.value[i] : null))
      .filter((e) => e) as Grid[]
);

function fetch() {
  return axios
    .get(getUrl("grid"))
    .then(({ data }) => {
      grids.value = data.map((g) => Grid.unserialize(JSON.stringify(g)));
      selected.value = new Array(grids.value.length).fill(false);
    })
    .catch((e) => {
      console.error("E", e);
    });
}

function onExported(canvas: HTMLCanvasElement) {
  if (!active.value) return;
  const thumb = document.createElement("canvas");
  const thumbWidth = 128;
  thumb.width = 128;
  thumb.height = Math.floor((canvas.height / canvas.width) * thumbWidth);
  thumb
    .getContext("2d")
    ?.drawImage(
      canvas,
      0,
      0,
      thumb.width * 2,
      thumb.height * 2,
      0,
      0,
      canvas.width / 4,
      canvas.height / 4
    );
  active.value.setThumbnail(thumb.toDataURL());
  save(active.value);
  shouldExport.value = false;
}

function onExportClick() {
  exporting.value = true;
}
function onDelete() {
  Promise.all(
    selectedGrids.value.map((shouldDelete, i) =>
      axios.delete(getUrl(`grid/${grids.value[i].id}`))
    )
  )
    .then(() => fetch())
    .then(() => (deleteVisible.value = false));
}

function createGrid() {
  const newGrid = new Grid(10, 10);
  newGrid.title = "Nouvelle Grille";
  return axios
    .post(getUrl("grid"), { grid: newGrid.serialize() })
    .then(() => fetch());
}

onMounted(() => {
  fetch().then(() => {
    const lastRoute = router.options.history.state.back as string;
    if (!lastRoute) return;
    const match = lastRoute.match(/\/grid\/(.*)/);
    if (!match || !match.length) return;
    active.value = grids.value.find((grid) => grid.id === match[1]);
    shouldExport.value = true;
  });
});
</script>

<style>
.leftpanel {
  width: 210px;
  min-width: 210px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.leftpanel > button {
  margin-bottom: 5px;
  width: 95px;
}
.n-grid {
  margin: 0 10px;
}
.card-title {
  display: flex;
}
.card-title > div {
  margin-left: auto;
}
.grids {
}
.grids > div {
  width: 100vw;
  height: calc(100vh - 55px);
  display: grid;
  grid-template-columns: 200px auto;
}
.wrapper > div {
  justify-content: center;
  gap: 8px 12px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 200px));
  width: calc(100vw - 210px);
}

.wrapper {
  max-height: calc(100vh - 55px);
  padding-bottom: 10px;
  overflow-x: hidden;
}
.n-card {
  box-shadow: 4px 4px 7px #ddd;
  height: 350px;
}
.n-card__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.n-card-cover {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
}
.n-dialog .n-dialog__action {
  display: flex;
  flex-direction: row;
  padding-top: 50px;
  justify-content: space-between;
  width: 100%;
}
.thumbnail {
  width: 170px;
  height: 170px;
  margin: 4px 0;
}
.add svg {
  transform: scale(5);
}
</style>

