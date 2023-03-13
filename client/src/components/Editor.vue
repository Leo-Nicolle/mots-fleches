<template>
  <div ref="editor" class="editor" :version="version">
    <div class="leftpanel">
      <slot>
        <span class="title">
          <h2>
            {{ grid.title ? grid.title : `Nouvelle Grille` }}
          </h2>
          <ModalOptions :grid="grid" @update="emit('update')" />
        </span>
        <Suggestion
          v-if="!focus.definition"
          :point="focus"
          :dir="dir"
          :query="''"
          :grid-id="grid.id"
          @hover="onHover"
          @click="onClick"
          @dir="(d) => (dir = d)"
          @mouseout="onMouseOut"
        >
        </Suggestion>
      </slot>
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
import { defineProps, defineEmits, ref, computed, watchEffect } from "vue";
import { Grid, Cell, Direction, nullCell, GridOptions } from "grid";
import SVGGrid from "./svg-renderer/Grid.vue";
import GridInput from "./svg-renderer/GridInput.vue";
import { defaultExportOptions } from "./svg-renderer/types";
import ModalOptions from "./forms/ModalOptions.vue";
import Suggestion from "./Suggestion.vue";

const props = defineProps<{ grid: Grid; options: GridOptions }>();
const emit = defineEmits<{
  (event: "update"): string;
  (event: "update:modelValue", value: Grid): void;
}>();
const editor = ref(null);
const dir = ref<Direction>("horizontal");
const focus = ref<Cell>(nullCell);
const version = ref(0);
const offset = ref<[number, number]>([0, 0]);

function refresh() {
  version.value++;
}
function onScroll(e) {
  offset.value = [e.target.scrollLeft, e.target.scrollTop];
}
watchEffect(() => {
  props.grid.highlight(props.grid.getBounds(focus.value, dir.value).cells);
});

function onHover(value: string) {
  const cells = props.grid.getBounds(focus.value, dir.value).cells;
  if (!cells || !cells.length) return;
  props.grid.suggest([value], [cells[0]], [dir.value]);
  refresh();
}
function onMouseOut(value: string) {
  props.grid.suggest([], [], []);
  refresh();
}
function onClick(value: string) {
  const cells = props.grid.getBounds(focus.value, dir.value).cells;
  if (!cells || !cells.length) return;
  props.grid.setWord(value, cells[0], dir.value);
  emit("update");
}
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
.editor-wrapper {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: 100vw;
}
.editor {
  display: flex;
  flex-direction: row;
  max-width: 100vw;
  overflow: hidden;
}
.editor > .suggestion {
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