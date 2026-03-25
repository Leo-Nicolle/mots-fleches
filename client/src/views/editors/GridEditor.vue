<template>
  <div id="Grid">
    <Editor v-if="grid && style" v-model="grid" :style="style"
      :collab-status="collab.status.value"
      :remote-users="collab.remoteUsers.value"
      @update="onGridUpdate"
      @focus-change="collab.setFocus"
    />
  </div>
</template>

<script setup lang="ts">
import Editor from "../../components/Editor.vue";
import { Grid, GridStyle } from "grid";
import { ref, onMounted, toRaw, watch } from "vue";
import { useRoute } from "vue-router";
import { api } from "../../api";
import { workerController } from '../../worker';
import { useCollab } from '../../js/useCollab';
import { trackEditingActivity } from '../../js/telemetry';

const grid = ref<Grid>();
const style = ref<GridStyle>();
const route = useRoute();
const isCollab = ref(false);
const collab = useCollab(route.params.id as string, grid, () => {
  if (grid.value) workerController.run(toRaw(grid.value));
});

function onGridUpdate() {
  trackEditingActivity('grid');
  if (isCollab.value) {
    collab.syncUpdate();
  }
}

function fetch() {
  return api
    .getGrid(route.params.id as string)
    .then((g) => {
      grid.value = g!;
      return api.db.getStyle(route.params.style as string || 'default');
    })
    .then((opts) => {
      style.value = opts;
    })
    .then(() => {
      api.getGrids().then((gs) => {
        const ids = gs.map((g) => g.id)
          .filter((id) => id !== grid.value!.id);
        return api.getUserDefinitions(ids);
      })
        .then((definitions) => workerController.setUserDefinitions(definitions));
    })
    .catch((e) => {
      console.error("E", e);
    });
}

// Autosave only when not in collab mode
watch(() => grid, () => {
  if (!grid.value || isCollab.value) return;
  api.saveGrid(toRaw(grid.value));
}, { deep: true });

onMounted(async () => {
  await fetch();

  // Start collab session when using the remote backend
  if (api.mode === 'remote') {
    try {
      await collab.connect();
      isCollab.value = true;
    } catch (e) {
      console.warn('Collab unavailable, falling back to autosave:', e);
    }
  }
});
</script>

<style>
#Grid {
  max-height: 100vh;
  overflow: hidden;
}

body {
  width: min-content;
  max-width: 100vw;
  overflow: hidden;
}
</style>
