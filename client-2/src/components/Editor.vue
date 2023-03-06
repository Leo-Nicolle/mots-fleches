<template>
  <div ref="editor" class="editor" :version="version">
    <ModalOptions v-model="modalProps" @update="emit('update')" />
    <div class="leftpanel">
      <span class="title">
        <h2>
          {{ grid.title ? grid.title : `Nouvelle Grille` }}
        </h2>
        <n-button @click="visible.visible = true">
          <n-icon>
            <CogIcon />
          </n-icon>
        </n-button>
      </span>

      <Suggestion
        v-if="!focusedCell.definition"
        :point="focus"
        :dir="dir"
        :query="''"
        :grid-id="grid.id"
        @hover="onHover"
        @click="onClick"
        @dir="(d) => (dir = d)"
      >
      </Suggestion>

      <n-scrollbar style="max-height: 80vh" v-else>
        <Options
          v-model="options"
          :arrows="true"
          :grid="true"
          :definition="true"
          :format="true"
        ></Options>
      </n-scrollbar>
    </div>
    <n-scrollbar style="max-height: calc(100vh - 100px)">
      <n-scrollbar style="max-width: calc(100vw - 100px)">
        <!-- <Exporterfabric :grid="grid" :options="options" 
          :texts="true"
          :arrow="true"
          :definitions="true"
          :shouldExport="true"
          :separators="true"
          :arrows="true"
        /> -->
        <SVGGrid
          :grid="grid"
          :options="options"
        ></SVGGrid>
        <EditGrid
          @type="onType"
          @focus="(point) => (focus = point)"
          @mouseenter="onMouseEnter"
          :grid="grid"
          :options="options"
          :suggestion="suggestion"
          :dir="dir"
        />
      </n-scrollbar>
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
  watch,
} from "vue";
import { Grid, Cell, Direction, Vec, nullCell, GridOptions } from "grid";
import { CogOutline as CogIcon } from "@vicons/ionicons5";

import EditGrid from "./EditGrid.vue";
import SVGGrid from "./svg-renderer/Grid.vue";

import Options from "./Options.vue";
import ModalOptions from "./ModalOptions.vue";
import Suggestion from "./Suggestion.vue";
import Exporterfabric from "./Exporter-fabric.vue";

import axios from "axios";
import { getUrl } from "../js/utils";

const options: GridOptions = ref({
  grid: {
    cellSize: "56px",
    borderColor: "black",
    borderSize: "10px",
    outerBorderSize: '20px',
    outerBorderColor: 'red',
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
  paper: {
    width: 21,
    height: 29.7,
    orientation: 'portrait',
    margin: {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    },
  },
});
const props = defineProps<{ grid: Grid }>();
const emit = defineEmits<{
  (event: "update"): string;
}>();
const editor = ref(null);
const dir = ref<Direction>("horizontal");
const focus = ref<Vec>({ x: -1, y: -1 });
let focusedCell = computed<Cell>(() => {
  const { x, y } = focus.value;
  return Grid.equal(nullCell, { x, y }) ? nullCell : props.grid.cells[y][x];
});
const suggestion = ref("");
const version = ref(0);
const visible = ref({ visible: false });

const modalProps = computed(() => {
  return {
    grid: props.grid,
    visible: visible.value,
  };
});

function refresh() {
  version.value++;
}
function onType() {
  console.log("UPDATE");
  emit("update");
}

function onToggleOption(visible) {
  console.log("watch", visible);
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
  emit("update");
}
function openOptions() {}
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
.grid-wrap {
  max-width: 200px;
  /* calc(100vw - 210px); */
  max-height: 200px;
  /* calc(100vh - 210px); */
  /* overflow-x: scroll; */
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