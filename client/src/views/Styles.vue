<template>
  <Layout
    v-if="styles.length"
    :eltList="styles"
    :onCreate="createStyle"
    :onDelete="onDelete"
    :has-create-button="false"
    :has-delete-button="false"
    :onClick="(style) => $router.push(`/styles/${style.id}`)"
    @select="(s) => (selected = s)"
  >
    <template v-slot:left-panel>
      <h3>{{ $t("nav.styles") }}</h3>
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
import { newStyle } from "grid";
import "highlight.js/styles/monokai.css";
import Layout from "../layouts/GridLayout.vue";
import { GridStyle } from "grid";
import { api } from "../api";
/**
 * View to display all styles in a grid layout
 */
const styles = ref<GridStyle[]>([]);
const selected = ref<GridStyle[]>([]);

function fetch() {
  return api.db
    .getStyles()
    .then((data) => {
      styles.value = data;
    })
    .catch((e) => {
      console.error("E", e);
    });
}
function onDelete() {
  Promise.all(
    selected.value.map((style, i) => api.db.deleteStyle(style.id))
  ).then(() => fetch());
}

function createStyle() {
  return api.db.pushStyle(newStyle()).then(() => fetch());
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

