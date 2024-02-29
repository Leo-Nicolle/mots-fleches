<template>
  <SVGGrid v-if="exportingStyle" ref="thumbnail" :grid="exportingGrid" :style="exportingStyle" :zoom="1" :focus="nullCell"
    dir="horizontal" :export-options="{ ...defaultExportOptions, definitions: true, texts: true, highlight: true, }">
  </SVGGrid>
</template>

<script setup lang="ts">
import {
  defineEmits,
  defineProps,
  nextTick,
  onMounted,
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
import axios from "axios";

/**
 * Button to add words from the grid to the dictionnary
 */
const props = defineProps<{
  /**
   * The grid to edit
   */
  styles: GridStyle[];
  modelValue: string[];
}>();


const exportingGrid = ref<Grid>();
const exportingStyle = ref<GridStyle>();

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
function exportSvg(index = 0) {
  if (!props.styles[index]) {
    return;
  }
  exportingStyle.value = props.styles[index];
  nextTick(() => {
    value.value.push(new XMLSerializer().serializeToString(thumbnail.value.$el));
    setTimeout(() => {
      exportSvg(index + 1);
    }, 100);
  });
}
function fetch() {
  return axios.get('/grid-style-thumbnail.json')
    .then(({ data }) => {
      exportingGrid.value = Grid.unserialize(data);
    });
}
watch(() => [props.modelValue, props.styles], () => {
  fetch()
    .then(() => exportSvg());

});
onMounted(() => {
  fetch()
    .then(() => exportSvg());
})

</script>

<style scoped></style>