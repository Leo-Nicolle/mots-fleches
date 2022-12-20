<template>
  <div class="grids">
    <n-scroll>
      <div>
        <n-card
          v-for="(grid, i) in grids"
          :key="i"
          @click="$router.push(`/grid/${grid.id}`)"
          :title="grid.title ? grid.title : `Nouvelle Grille`"
        >
          <template #cover>
            <img
              v-if="active !== grid || !shouldExport"
              class="thumbnail"
              :src="grid.thumbnail || '/assets/logo.png'"
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
    </n-scroll>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import axios from "axios";
import { getUrl } from "../js/utils";
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
  document.body.appendChild(canvas);
  document.body.appendChild(thumb);

  // active.value.setThumbnail(thumb.toDataURL());
  shouldExport.value = false;
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
.n-grid {
  margin: 0 10px;
}
.grids {
  width: 100vw;
  height: calc(100vh - 55px);
}
.grids > n-scroll > div {
  grid-template-columns: repeat(12, minmax(200px, 200px));
  width: 100%;
  display: grid;
  gap: 8px 12px;
}
.n-scroll {
  max-height: calc(100vh - 55px);
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
</style>

