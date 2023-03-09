<template>
  <div class="exporter">
    <GridSvg
      :ref="svg"
      :grid="grid"
      :options="options"
      :export-options="{
        ...defaultExportOptions,
        texts: true,
        arrows: false,
        highlight: false,
      }"
      dir="horizontal"
      :focused="nullCell"
    />
  </div>
</template>

<script setup lang="ts">
import { defaultExportOptions } from "./types";
import { defineEmits, ref, defineProps, watchEffect, nextTick } from "vue";
import GridSvg from "./Grid";
import { Grid, GridOptions, nullCell, Vec } from "grid";
import Vector from "vector2js";

const svg = ref<SVGSVGElement>(null as unknown as SVGSVGElement);
const props = defineProps<{
  grid: Grid;
  options: GridOptions;
  shouldExport: boolean;
}>();

const emit = defineEmits<{
  (event: "export-png", value: string): void;
}>();

watchEffect(() => {
  if (!props.shouldExport) return;
  nextTick().then(() => {
    const img = document.createElement("img");
    document.body.appendChild(img);
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    var xml = new XMLSerializer().serializeToString(
      document.querySelector(".exporter")
    );
    var svg64 = btoa(xml);
    var b64Start = "data:image/svg+xml;base64,";
    var image64 = b64Start + svg64;
    debugger;
    img.addEventListener('load', () => {
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      emit("export-png", canvas.toDataURL());
    })
    img.src = image64;
  });
});
</script>

<style scoped>
</style>