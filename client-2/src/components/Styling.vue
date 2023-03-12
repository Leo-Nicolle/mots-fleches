<template>
  <div ref="settings" class="settings" :version="version">
    <ModalOptions v-model="modalProps" @update="emit('update')" />
    <div class="leftpanel">
      <span class="title">
        <h2>
          Styles
        </h2>
        <n-button @click="visible.visible = true">
          <n-icon>
            <CogIcon />
          </n-icon>
        </n-button>
        <Options 
          v-model="options"
          grid definition arrows format />
      </span>
    </div>
    <n-scrollbar
      x-scrollable
      :on-scroll="onScroll"
      style="max-height: calc(100vh - 100px); max-width: calc(100vw - 100px)"
    >
      <SVGGrid
        @focus="(cell) => (focus = cell)"
        :grid="grid"
        :focus="focus"
        :dir="dir"
        :options="options"
        :export-options="{
          ...defaultExportOptions,
          texts: true,
          highlight: true,
        }"
      ></SVGGrid>
      <GridInput
        :grid="grid"
        :dir="dir"
        :options="options"
        :cell="focus"
        :offset="offset"
        @focus="(point) => (focus = point)"
        @update="emit('update')"
      >
      </GridInput>
    </n-scrollbar>
  </div>
</template>

<script setup lang="ts">
import {
  defineProps,
  defineEmits,
  ref,
  computed,
  watchEffect,
} from "vue";
import { Grid, Cell, Direction, nullCell, GridOptions } from "grid";
import { CogOutline as CogIcon } from "@vicons/ionicons5";
import SVGGrid from "./svg-renderer/Grid.vue";
import GridInput from "./svg-renderer/GridInput.vue";
import Options from "./forms/Options.vue";
import { defaultExportOptions } from "./svg-renderer/types";
import ModalOptions from "./forms/ModalOptions.vue";

const props = defineProps<{ grid: Grid }>();
const emit = defineEmits<{
  (event: "update"): string;
}>();
const settings = ref(null);
const dir = ref<Direction>("horizontal");
const focus = ref<Cell>(nullCell);
const version = ref(0);
const visible = ref({ visible: false });
const offset = ref<[number, number]>([0, 0]);

const modalProps = computed(() => {
  return {
    grid: props.grid,
    visible: visible.value,
  };
});

function onScroll(e) {
  offset.value = [e.target.scrollLeft, e.target.scrollTop];
}
watchEffect(() => {
  props.grid.highlight(props.grid.getBounds(focus.value, dir.value).cells);
});
</script>

<style scoped>
.title {
  display: flex;
  justify-content: space-between;
}
.title .n-button {
  margin-right: 4px;
}
h2 {
  margin-top: 0;
}
.settings-wrapper {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: 100vw;
}
.settings {
  display: flex;
  flex-direction: row;
  max-width: 100vw;
  overflow: hidden;
}
.settings > .suggestion {
  margin-right: 2px;
  max-width: 180px;
}
.leftpanel {
  width: 210px;
  min-width: 210px;
  overflow: hidden;
}
.leftpanel > .n-scrollbar {
  max-height: 100vh;
}
</style>