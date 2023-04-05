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
      <div class="wrapper scroll" v-if="grids.length === options.length">
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
              <div class="card-body" @click="$router.push(`/grid/${grid.id}`)">
                <div class="preview">
                  <SVGGrid
                    :grid="grid"
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
                {{ grid.comment ? grid.comment : "Nouvelle Grille" }}
              </div>
            </template>
          </n-card>

          <n-card @click="createGrid" title="Créer">
            <template #default>
              <n-button class="preview add">
                <n-icon>
                  <AddIcon />
                </n-icon>
              </n-button>
            </template>
          </n-card>
        </div>

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
    <!-- <Exporting v-else :grids="selectedGrids" :options="options" /> -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import axios from "axios";
import { AddCircleOutline as AddIcon } from "@vicons/ionicons5";
import SVGGrid from "../components/svg-renderer/Grid.vue";
import { defaultExportOptions } from "../components/svg-renderer/types";

import { getUrl, save } from "../js/utils";
import { getAllWords, Grid, GridOptions, nullCell } from "grid";
const router = useRouter();
const grids = ref<Grid[]>([]);
const options = ref<GridOptions[]>([]);

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
      console.log(getAllWords(grids.value));
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
      console.log(options.value);
    })
    .catch((e) => {
      console.error("E", e);
    });
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

<style scoped>
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
.preview {
  width: 170px;
  height: 170px;
  max-width: 170px;
  max-height: 170px;

  overflow: hidden;
}
.add svg {
  transform: scale(5);
}

.card-body {
  /* max-width: 170px;
  max-height: 170px;
  overflow: hidden; */
}
.card-body > svg {
  max-width: 340px;
  max-height: 340px;
}
</style>

