<template>
  <SVGGrid v-if="exportingStyle && exportingGrid" ref="thumbnail" :grid="exportingGrid" :style="exportingStyle" :zoom="1"
    :focus="nullCell" dir="horizontal" :export-options="exportOptions">
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
  computed,
} from "vue";
import SVGGrid from "./Grid.vue";
import {
  Grid,
  GridStyle,
  isSolutionStyle,
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
const exportOptions = computed(() => {
  if (!exportingStyle.value) {
    return {};
  }
  if (!isSolutionStyle(exportingStyle.value)) {
    return {
      ...defaultExportOptions,
      definitions: true,
      splits: true,
      texts: true,
      highlight: true,
    };
  }
  return {
    ...defaultExportOptions,
    definitions: false,
    splits: false,
    texts: true,
    arrows: false,
    highlight: true,
  };

});
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
watch(() => [props.styles], () => {
  fetch()
    .then(() => {
      value.value = [];
      exportSvg();
    });
});
watch(props.modelValue, () => {
  exportSvg(value.value.length);
});
onMounted(() => {
  fetch()
    .then(() => value.value = []);
})

</script>

<style scoped></style>