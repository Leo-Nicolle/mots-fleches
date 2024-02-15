<template>
  <SVGGrid ref="thumbnail" :grid="exportingGrid" :style="style" :zoom="1" :focus="nullCell" dir="horizontal"
    :export-options="{ ...defaultExportOptions, definitions: true, texts: true, highlight: true, }"></SVGGrid>
</template>

<script setup lang="ts">
import {
  defineEmits,
  defineProps,
  nextTick,
  onMounted,
  watch,
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
  grids: Grid[];
  style: GridStyle;
}>();
const exportingGrid = ref<Grid>(new Grid(3, 3, 'exporting-grid'));
const emit = defineEmits<{
  /**
   * The grid has been updated
   */
  (event: "update", value: string[]): void;
}>();
const thumbnail = ref();
const urls = ref<string[]>([]);
const index = ref(0);
const canvas = document.createElement("canvas");
canvas.width = 170;
canvas.height = 170;
const ctx = canvas.getContext("2d")!;
function exportSvg() {
  if (!props.grids[index.value]) {
    return emit("update", urls.value);
  }
  exportingGrid.value.cells.forEach((row, i) => {
    row.forEach((cell, j) => {
      exportingGrid.value.cells[i][j] = { ...props.grids[index.value].cells[i][j] };
    });
  });
  nextTick(() => {
    urls.value.push(new XMLSerializer().serializeToString(thumbnail.value.$el));
    setTimeout(() => {
      index.value++;
    }, 100);
  });
}

watch(props.grids, () => {
  index.value = 0;
  urls.value = [];
});
watch(index, () => {
  exportSvg();
});
onMounted(() => {
  exportSvg();
})

</script>

<style scoped></style>