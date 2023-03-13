<template>
  <div ref="exporter" class="exporter">
    <n-button @click="print">Exporter</n-button>
    <SVGGrid  ref="grid" v-if="grid && options" :grid="grid" dir="horizontal" 
    :export-options="{...defaultExportOptions, texts: true, highlight: true}"
    :focus="nullCell" :options="options"/>
  </div>
</template>

<script setup lang="ts">
import { defineProps, watchEffect, ref } from "vue";
import SVGGrid from "./svg-renderer/Grid.vue";
import { Grid, GridOptions, nullCell } from "grid";
import { defaultExportOptions } from "./svg-renderer/types";
import { getUrl } from "../js/utils";
import axios from "axios";

const props = defineProps<{ grid: Grid }>();
const options = ref<GridOptions>();
const exporter = ref<HTMLDivElement>();

watchEffect(() => {
  axios.get(getUrl(`options/${props.grid.optionsId}`))
  .then(({data}) => options.value = data);
});

function print(){
  if (!exporter.value) return;
  const svg = exporter.value.querySelector('svg').cloneNode(true) as SVGSVGElement;
  svg.setAttribute("viewBox", `0 0 ${svg.width.baseVal.value} ${svg.height.baseVal.value}`);
  const toExport = svg.outerHTML.replaceAll('svg:style', 'style');
  console.log(toExport.slice(0, 150))
  const blob = new Blob([toExport], {type: "image/svg+xml;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `grille-${props.grid.title}.svg`;
    document.body.appendChild(a);
    a.click();
    console.log('ici');
    // window.URL.revokeObjectURL(url);  
}

</script>

<style scoped>
/* Targets all the pages */
.exporter > button {
  position: fixed;
  top: 10px;
  left: 100px;
}
.exporter > svg {
  position: fixed;
  top: 100%;
}
</style>