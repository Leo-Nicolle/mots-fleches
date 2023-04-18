<template>
  <div ref="exporter" class="exporter">
    <n-button @click="print" round>Exporter</n-button>
    <SVGGrid
      ref="grid"
      v-if="grid && options"
      :grid="grid"
      dir="horizontal"
      :export-options="{
        ...defaultExportOptions,
        texts: true,
        highlight: true,
      }"
      :focus="nullCell"
      :options="options"
    />
  </div>
</template>

<script setup lang="ts">
import { defineProps, watchEffect, ref } from "vue";
import SVGGrid from "./svg-renderer/Grid.vue";
import { Grid, GridOptions, nullCell } from "grid";
import { defaultExportOptions } from "../types";
import { getUrl } from "../js/utils";
import axios from "axios";
/**
 * Button to export a grid as SVG
 */
const props = defineProps<{
  /**
   * Grid to export
   */
  grid: Grid;
}>();
const options = ref<GridOptions>();
const exporter = ref<HTMLDivElement>();

watchEffect(() => {
  axios
    .get(getUrl(`options/${props.grid.optionsId}`))
    .then(({ data }) => (options.value = data));
});

function print() {
  if (!exporter.value) return;
  const svg = (
    exporter.value.querySelector("svg").cloneNode(true) as SVGSVGElement
  ).outerHTML;
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = `grille-${props.grid.title}.svg`;
  document.body.appendChild(a);
  a.click();
}
</script>

<style scoped>
.exporter > svg {
  position: fixed;
  top: 100%;
}
</style>