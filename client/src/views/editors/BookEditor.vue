<template>
  <Book v-if="grids && style && solutionStyle" :grids="grids" :style="style" :solutionStyle="solutionStyle"
    :exportOptions="exportOptions" />
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { Grid, GridStyle, SolutionStyle } from "grid";
import { ExportOptions } from "../../types";
import Book from "../../components/Book.vue";
import { api } from "../../api";
/**
 * TODO, not used yet, and not sure to use
 */
const route = useRoute();

const grids = ref<Grid[]>([]);
const style = ref<GridStyle>();
const solutionStyle = ref<SolutionStyle>();

const exportOptions = ref<Partial<ExportOptions>>({
  margins: false,
});

function fetch() {
  const promise = route.query.ids
    ? Promise.all(
      (route.query.ids as string).split(",").map((id) => api.getGrid(id))
    ).then((gs) => {
      grids.value = gs.filter((e) => e) as Grid[];
    })
    : api.getGrids().then((gs) => {
      grids.value = gs;
    });
  return promise
    .then(() => api.db.getStyle("solution"))
    .then((solutions) => {
      solutionStyle.value = solutions as SolutionStyle;
    })
    .then(() => api.db.getStyle("default"))
    .then((opts) => {
      style.value = opts as GridStyle;
    })
    .catch((e) => {
      console.error("E", e);
    });
}

onMounted(() => {
  fetch();
});
</script>

<style scoped>
.paper {
  margin: 20px;
}

.solutions {
  display: flex;
  flex-direction: row;
  height: 100%;
}

.leftpanel {
  width: 210px;
  min-width: 210px;
  overflow: hidden;
}

.leftpanel>.n-scrollbar {
  max-height: 100vh;
}

.viewer {
  position: relative;
  top: 20px;
}
</style>

