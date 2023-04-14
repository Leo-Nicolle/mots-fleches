<template>
  <Layout @scroll="onScroll">
    <template #left-panel>
      <span class="title">
        <h2>
          {{ grid.title ? grid.title : `Nouvelle Grille` }}
        </h2>
        <ModalOptions
          :modelValue="grid"
          @update:model-value="emit('size-update')"
        />
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
    </template>
    <template #body>
      <div class="container">

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
    </div>

    </template>
  </Layout>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, computed, watchEffect } from "vue";
import { Grid, Cell, Direction, nullCell, GridOptions } from "grid";
import Layout from "../layouts/Main.vue";
import SVGGrid from "./svg-renderer/Grid.vue";
import GridInput from "./svg-renderer/GridInput.vue";
import { defaultExportOptions } from "./svg-renderer/types";
import ModalOptions from "./forms/ModalOptions.vue";
import Suggestion from "./Suggestion.vue";

const props = defineProps<{ grid: Grid; options: GridOptions }>();
const emit = defineEmits<{
  (event: "update"): string;
  (event: "update:modelValue"): void;
  (event: "size-update"): void;
}>();
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

<style>
</style>