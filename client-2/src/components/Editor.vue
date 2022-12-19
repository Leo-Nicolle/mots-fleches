<template>
  <div ref="editor" class="editor" :version="version">
    <div class="leftpanel">
      <Suggestion
        v-if="false && !focusedCell.definition"
        :point="focus"
        :dir="dir"
        :query="''"
        :grid-id="grid.id"
        @hover="onHover"
        @click="onClick"
        @dir="(d) => (dir = d)"
      >
      </Suggestion>

      <n-scrollbar v-else>
        <Options  v-model="options"></Options>
      </n-scrollbar>
    </div>
    <EditGrid
      @type="onType"
      @focus="(point) => (focus = point)"
      @out="() => grid.suggest([], [], [])"
      @mouseenter="onMouseEnter"
      :grid="grid"
      :focused-cell="focusedCell"
      :width="width"
      :options="options"
      :suggestion="suggestion"
      :dir="dir"
    />
    <Exporter
      :grid="grid"
      :options="options"
    />
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, computed, watchEffect } from "vue";
import { Grid, Cell, Direction, Vec, nullCell, GridOptions } from "../grid";
import EditGrid from "./EditGrid.vue";
import Exporter from "./Exporter.vue";

import Options from "./Options.vue";
import Suggestion from "./Suggestion.vue";

const options: GridOptions = ref({
  grid: {
    cellSize: "56px",
    borderColor: "black",
    borderSize: "1px",
  },
  definition: {
    font: "sans-serif",
    size: "12px",
    color: "black",
  },
  arrow: {
    size: "2em",
    color: "black",
  },
});

const props = defineProps<{ grid: Grid }>();
const emit = defineEmits<{
  (event: "update", value: number): string;
}>();
const editor = ref(null);
const dir = ref<Direction>("horizontal");
const focus = ref<Vec>({ x: -1, y: -1 });
let focusedCell = computed<Cell>(() => {
  const { x, y } = focus.value;
  console.log("compute");
  return Grid.equal(nullCell, { x, y }) ? nullCell : props.grid.cells[y][x];
});
const suggestion = ref("");
const version = ref(0);
const width = ref(56);

setTimeout(() => {
  emit("update", 1);
}, 3000);

function refresh() {
  version.value++;
}
function onType() {
  emit("update", 1);
}
function onHover(value: string) {
  const cells = props.grid.getBounds(focus.value, dir.value).cells;
  if (!cells || !cells.length) return;
  props.grid.suggest([value], [cells[0]], [dir.value]);
  refresh();
}
function onMouseEnter() {
  setTimeout(() => {
    props.grid.suggest([], [], []);
  }, 100);
}
function onClick(value: string) {
  const cells = props.grid.getBounds(focus.value, dir.value).cells;
  if (!cells || !cells.length) return;
  props.grid.setWord(value, cells[0], dir.value);
  refresh();
}
</script>

<style scoped>
.editor {
  display: flex;
  flex-direction: row;
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