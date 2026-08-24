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
  onBeforeUnmount,
  watch,
  ref,
} from "vue";
import SVGGrid from "./Grid.vue";
import {
  Grid,
  GridStyle,
  nullCell
} from "grid";
import { defaultExportOptions } from "../../types";
import { useModel } from "../../js/useModel";

/**
 * Button to add words from the grid to the dictionnary
 */
const props = defineProps<{
  /**
   * The grid to edit
   */
  grids: Grid[];
  style: GridStyle;
  modelValue: string[];
}>();


const exportingGrid = ref<Grid>(new Grid(3, 3, 'exporting-grid'));
const emit = defineEmits<{
  /**
   * The grid has been updated
   */
  (event: "update:modelValue", value: string[]): void;
}>();
const value = useModel(props, emit);
const thumbnail = ref();
const canvas = document.createElement("canvas");
canvas.width = 170;
canvas.height = 170;
let timeout: ReturnType<typeof setTimeout> | null = null;
let unmounted = false;
function exportSvg(index = 0) {
  if (unmounted) return;
  const grid = props.grids[index];
  if (!grid || !grid.cells) return;
  exportingGrid.value.resize(grid.rows, grid.cols);
  grid.cells.forEach((row, i) => {
    row.forEach((cell, j) => {
      exportingGrid.value.cells[i][j] = { ...cell };
    });
  });
  nextTick(() => {
    if (unmounted || !thumbnail.value) return;
    value.value.push(new XMLSerializer().serializeToString(thumbnail.value.$el));
    timeout = setTimeout(() => exportSvg(index + 1), 100);
  });
}

watch(() => [props.modelValue, props.grids], () => {
  exportSvg();
});
onMounted(() => {
  exportSvg();
});
onBeforeUnmount(() => {
  unmounted = true;
  if (timeout) clearTimeout(timeout);
});

</script>

<style scoped></style>