<template>
  <Layout>
    <template v-slot:left-panel v-if="style && grid">
      <GridForm :model-value="grid" />
      <GridStyleForm v-model="style" grid definition arrows format />
    </template>
    <template v-slot:body>
      <GridPaper v-if="grid && style" class="paper" :grid="grid" :export-options="{
        ...defaultExportOptions,
        texts: true,
        highlight: true,
      }" :style="style" />
      <NoGrid v-else />
    </template>
  </Layout>
</template>

<script setup lang="ts">
import GridPaper from "../../components/GridPaper.vue";
import GridStyleForm from "../../components/forms/GridStyleForm.vue";
import GridForm from "../../components/forms/GridForm.vue";
import Layout from "../../layouts/Main.vue";
import NoGrid from "../../components/NoGrid.vue";
import { defaultExportOptions } from "../../types";
import { Grid, GridStyle } from "grid";
import { ref, onMounted, unref, toRaw } from "vue";
import { useRoute } from "vue-router";
import { api } from "../../api";
import { watch } from "vue";
/**
 * View to edit a grid style
 */
const grid = ref<Grid>();
const style = ref<GridStyle>();
const saveTimeout = ref(0);
const route = useRoute();
function fetch() {
  const id = route.params.id as string || 'default';
  return Promise.all([api.getGrids(), api.db.getStyle(id)])
    .then(([grids, opts]) => {
      grid.value = grids[0];
      style.value = opts;
    })
    .catch((e) => {
      console.error("E", e);
    });
}

function onUpdate() {
  clearTimeout(saveTimeout.value);
  saveTimeout.value = setTimeout(() => {
    if (!style.value) return;
    api.db.pushStyle(toRaw(style.value) as unknown as GridStyle);
  }, 100);
}

watch(style, onUpdate, { deep: true });

onMounted(() => {
  fetch();
});
</script>

<style lang="css"></style>
