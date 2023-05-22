<template>
  <Layout
    v-if="optionsList.length"
    :eltList="optionsList"
    :onCreate="createOptions"
    :onDelete="onDelete"
    :onClick="(options) => $router.push(`/options/${options.id}`)"
    @select="(s) => (selected = s)"
  >
    <template v-slot:left-panel>
      <h3>{{ $t("nav.options") }}</h3>
    </template>
    <template v-slot:card-title="{ elt }">
      <span>
        {{ elt.name ? elt.name : $t("buttons.newStyle") }}
      </span>
    </template>
    <template #card-body="{ elt }">
      <pre v-highlightjs>
        <code class="JSON">{{JSON.stringify(elt, 0, 2)}}</code>
      </pre>
    </template>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { newOptions } from "grid";
import VueHighlightJS from "vue3-highlightjs";
import "highlight.js/styles/monokai.css";
import Layout from "../layouts/GridLayout.vue";
import { Grid, GridOptions } from "grid";
import { api } from "../api";
/**
 * View to display all options in a grid layout
 */
const router = useRouter();
const optionsList = ref<GridOptions[]>([]);
const selected = ref<GridOptions[]>([]);

function fetch() {
  return api.db
    .getOptions()
    .then((data) => {
      optionsList.value = data;
    })
    .catch((e) => {
      console.error("E", e);
    });
}
function onDelete() {
  Promise.all(
    selected.value.map((option, i) => api.db.deleteOption(option.id))
  ).then(() => fetch());
}

function createOptions() {
  return api.supadb.pushOption(newOptions()).then(() => fetch());
  // return api.db.pushOption(newOptions()).then(() => fetch());
}

onMounted(() => {
  fetch();
});
</script>

<style scoped>
.card-body {
  height: 100%;
  display: flex;
  align-items: center;
  align-content: space-around;
  justify-content: space-around;
}
.card-body > pre {
  padding: 0;
  margin: 0;
  overflow: hidden;
  max-height: 275px;
  max-width: 295px;
}
</style>

