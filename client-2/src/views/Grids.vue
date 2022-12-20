<template>
  <div class="grids">
    <n-scroll>
      <n-grid :x-gap="12" :y-gap="8" :cols="4">
        <n-grid-item
          v-for="(grid, i) in grids"
          :key="i"
          @click="$router.push(`/grid/${grid.id}`)"
        >
          <n-card :title="grid.title ? grid.title : `Nouvelle Grille`">
            <template #cover>
              <img v-if="imgs[i]" class="thumbnail" :src="imgs[i]" />
            </template>
            {{ grid.comment ? grid.comment : "Nouvelle Grille" }}
          </n-card>
        </n-grid-item>
      </n-grid>
      <Exporter
        v-if="grid"
        :grid="grid"
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
import axios from "axios";
import { getUrl } from "../js/utils";
import Exporter from "../components/Exporter.vue";
import { Grid, GridOptions } from "../grid";

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
const grid = ref<Grid>();
const imgs = ref<string[]>([]);

function fetch() {
  return axios
    .get(getUrl("grid"))
    .then(({ data }) => {
      grids.value = data.map((g) => Grid.unserialize(JSON.stringify(g)));
      grid.value = grids.value[0];
      console.log(grids.value.length);
    })
    .catch((e) => {
      console.error("E", e);
    });
}
function onExported(canvas: HTMLCanvasElement) {
  grids.value.forEach((g, i) => {
    if (!grid.value || grid.value.id !== g.id) return;
    imgs.value[i] = canvas.toDataURL();
  });
  const noThumbnail = grids.value.filter((g, i) => !imgs.value[i]);
  if (!noThumbnail.length) return;
  grid.value = noThumbnail[0];
}

onMounted(() => {
  fetch().then(() => {});
});

//   mounted() {
//     this.fetch();
//   },
// };
</script>

<style>
.n-grid {
  margin: 0 10px;
}
.grids {
  width: 100vw;
  height: calc(100vh - 55px);
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
.thumbnail {
  max-width: 200px;
  height: auto;
  margin: 4px auto;
}
</style>

