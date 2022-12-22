<template>
  <div class="grids">
    <div class="leftpanel">
LSSADOSA

    </div>
    <div class="wrapper scroll">
      <div>
        <n-card
          v-for="(grid, i) in grids"
          :key="i"
          @click="$router.push(`/grid/${grid.id}`)"
          :title="grid.title ? grid.title : `Nouvelle Grille`"
        >
          <template #cover>
            <button v-if="!grid.thumbnail && (active !== grid || !shouldExport)" class="thumbnail add" grid.thumbnail>
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
          </template>
          {{ grid.comment ? grid.comment : "Nouvelle Grille" }}
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import axios from "axios";
import { AddCircleOutline as AddIcon, HeartOutline } from "@vicons/ionicons5";

import { getUrl, save } from "../js/utils";
import Exporter from "../components/Exporter.vue";
import { Grid, GridOptions } from "../grid";
const router = useRouter();
const options: GridOptions = ref({
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
});

const grids = ref<Grid[]>([]);
const active = ref<Grid>();
const shouldExport = ref(false);

function fetch() {
  return axios
    .get(getUrl("grid"))
    .then(({ data }) => {
      grids.value = data.map((g) => Grid.unserialize(JSON.stringify(g)));
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

function createGrid() {
  const newGrid = new Grid(10, 10);
  newGrid.name = "Nouvelle Grille";
  return axios.post(getUrl("grid"), { grid: newGrid.serialize() })
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
}
.n-grid {
  margin: 0 10px;
}
.grids {
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
  cursor: pointer;
  height: 350px;
}
.n-card:hover {
  background: #ddd;
}
.n-card-cover {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
}
.thumbnail {
  width: 170px;
  height: 170px;
  margin: 4px auto;
}
.add svg {
  transform: scale(5);
}
</style>

