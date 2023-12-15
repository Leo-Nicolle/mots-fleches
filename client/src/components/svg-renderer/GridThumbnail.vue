<template>
  <SVGGrid v-if="grid" ref="thumbnail" :grid="grid" :style="style" :zoom="1" :focus="nullCell" dir="horizontal"
    :export-options="{ ...defaultExportOptions, texts: true, highlight: true, }"></SVGGrid>
</template>

<script setup lang="ts">
import {
  defineEmits,
  defineProps,
  nextTick,
  onMounted,
  ref,
  watchEffect,
} from "vue";
import SVGGrid from "./Grid.vue";
import {
  Grid,
  GridStyle,
  nullCell
} from "grid";
import { defaultExportOptions } from "../../types";

/**
 * Button to add words from the grid to the dictionnary
 */
const props = defineProps<{
  /**
   * The grid to edit
   */
  grid: Grid;
  style: GridStyle;
}>();
const emit = defineEmits<{
  /**
   * The grid has been updated
   */
  (event: "update", value: string): void;
}>();
const thumbnail = ref();
const canvas = document.createElement("canvas");
canvas.width = 170;
canvas.height = 170;
const ctx = canvas.getContext("2d")!;
function exportSvg() {
  nextTick(() => {
    const img = document.createElement("img");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // set it as the source of the img element
    img.onload = function () {
      // draw the image onto the canvas
      ctx.drawImage(img, 0, 0);
      emit("update", canvas.toDataURL());
    };
    img.src = `data:image/svg+xml;base64,${btoa(new XMLSerializer().serializeToString(thumbnail.value.$el))}`;
  });
}
watchEffect(() => {
  if (!props.grid || !props.grid.id || !thumbnail.value) return;
  exportSvg();
},);
</script>

<style scoped></style>