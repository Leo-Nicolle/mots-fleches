<template>
  <div class="exporting">
    <div class="leftpanel">
      <n-scrollbar>
        <h3>Export</h3>
        <Options
          v-model="optionsV"
          :format="true"
          :grid="false"
          :arrows="false"
          :definition="false"
        />
      </n-scrollbar>
    </div>
    <div class="wrapper scroll">
      <n-image width="100" :src="previewUrl" />
    </div>
    <Exporter
      v-if="active"
      :ref="preview"
      :grid="active"
      :shouldExport="shouldExport"
      :arrows="false"
      :separators="false"
      :texts="true"
      :scale="2"
      :definitions="false"
      :options="options"
      @exported="onExported"
    />
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  onMounted,
  computed,
  defineProps,
  defineEmits,
  watchEffect,
} from "vue";
import { useRouter, useRoute } from "vue-router";
import axios from "axios";
import { AddCircleOutline as AddIcon, HeartOutline } from "@vicons/ionicons5";

import { getUrl, save } from "../js/utils";
import Exporter from "../components/Exporter.vue";
import Options from "../components/Options.vue";
import { Grid, GridOptions, DPI_TO_PIXEL } from "../grid";
import { fromUnixTime } from "date-fns";

const props = defineProps<{ grids: Grid[]; options: GridOptions }>();
const emit = defineEmits<{
  (event: "update:modelValue", value: GridOptions): void;
}>();

const active = ref<Grid>();
const shouldExport = ref(false);
const previewUrl = ref("");

const optionsV = computed({
  get: () => props.options,
  set: (unit) => emit("update:modelValue", props.options),
});
onMounted(() => {
  console.log(props.options);
  active.value = props.grids[0] as Grid;
  shouldExport.value = true;
});

watchEffect(() => {
  console.log("watch effect");
  props.options.paper.margin.left +
  props.options.paper.margin.top +
  props.options.paper.margin.right +
  props.options.paper.margin.bottom
    ? (shouldExport.value = true)
    : "";
});

function onExported(canvas) {
  console.log(canvas.width)
  const preview = document.createElement("canvas");
  const paper = props.options.paper;
  const [width, height, top, left, bottom, right] = [
    paper.width,
    paper.height,
    paper.margin.top,
    paper.margin.left,
    paper.margin.bottom,
    paper.margin.right,
  ].map((e) => (e * paper.dpi * 10) / DPI_TO_PIXEL);
  preview.width = width;
  preview.height = height;
  const ctx = preview.getContext("2d") as CanvasRenderingContext2D;
  ctx.fillStyle = "#ccddff";
  ctx.fillRect(0, 0, width, height);

  ctx.drawImage(
    canvas,
    0,
    0,
    canvas.width,
    canvas.height,
    left,
    top,
    width - left - right,
    height - top - bottom
  );
  previewUrl.value = preview.toDataURL();
  shouldExport.value = false;
}
</script>

<style>
.leftpanel {
  width: 210px;
  min-width: 210px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.leftpanel > button {
  margin-bottom: 5px;
  width: 95px;
}
.leftpanel > .n-scroll-bar {
  max-height: calc(100vh - 54px);
}
</style>

