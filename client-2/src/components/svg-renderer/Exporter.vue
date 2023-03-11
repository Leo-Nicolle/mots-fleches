<template>
  <GridSvg
    class="exporter"
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
    const svg = document.querySelector(".exporter")as SVGSVGElement;
    canvas.width = 128;
    canvas.height = 128;
    document.body.appendChild(canvas);

    return new Promise((resolve) => {
      const blob = new Blob([svg.outerHTML], {
        type: "image/svg+xml;charset=utf-8",
      });
      const blobURL = URL.createObjectURL(blob);
      img.onload = () => resolve(img);
      img.src = blobURL;
    }).then(() => {

      //@ts-ignore
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      emit("export-png", canvas.toDataURL());
    });
  });
});
</script>

<style scoped>
</style>