<template>
  <Book v-if="grids && style && solutionStyle" :grids="grids" :style="style" :solutionStyle="solutionStyle"
    :exportOptions="exportOptions" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useRoute } from "vue-router";
import { Grid, GridStyle, SolutionStyle } from "grid";
import { ExportOptions } from "../../types";
import Book from "../../components/Book.vue";
import { api } from "../../api";
import { usePrintMessage, cleanupPrintMessage, sendReadyMessage, sendDoneMessage } from '../../js/usePrintMessage';
/**
 * View to print a book of grids (with solutions and index)
 * it uses route querry to know which grids to print
 */
const route = useRoute();
const grids = ref<Grid[]>([]);
const style = ref<GridStyle>();
const solutionStyle = ref<SolutionStyle>();
let registered = false;
const exportOptions = ref<Partial<ExportOptions>>({
  margins: false,
});
function register() {
  if (registered) return;
  usePrintMessage();
  window.onafterprint = () => {
    sendDoneMessage();
  };
}

function fetch() {
  if (route.query.enabled === 'false') return Promise.resolve();
  const promise = route.query.ids
    ? Promise.all(
      (route.query.ids as string).split(",").map((id) => api.getGrid(id))
    ).then((gs) => {
      grids.value = gs.filter((g) => g) as Grid[];
    })
    : api.getGrids().then((gs) => {
      grids.value = gs;
    });
  const solutionId = route.query.solution as string || 'solution';
  const styleId = route.query.style as string || 'default';
  return promise
    .then(() => api.db.getStyle(solutionId))
    .then((solutions) => {
      solutionStyle.value = solutions as SolutionStyle;
    })
    .then(() => api.db.getStyle(styleId))
    .then((s) => {
      style.value = s as GridStyle;
    })
    .then(() => {
      register();
      sendReadyMessage();
    })
    .catch((e) => {
      console.error("E", e);
    });
}

onMounted(() => {
  fetch();
});
watch([route], () => {
  fetch();
});
onUnmounted(() => {
  cleanupPrintMessage();
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
