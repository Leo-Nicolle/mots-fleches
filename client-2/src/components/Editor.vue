<template>
  <div ref="editor" class="editor" :version="version">
    <Suggestion
      :point="focus"
      :dir="dir"
      :query="''"
      :grid-id="grid.id"
      @hover="onHover"
      @click="onClick"
      @dir="(d) => (dir = d)"
    >
    </Suggestion>
    <EditGrid
      @type="onType"
      @focus="(point) => (focus = point)"
      @out="() => grid.suggest([], [], [])"
      @mouseenter="onMouseEnter"
      :grid="props.grid"
      :suggestion="suggestion"
      :dir="dir"
    />
    <Definition
      :cell="
        Grid.equal(nullCell, focus) ? nullCell : grid.cells[focus.y][focus.x]
      "
    ></Definition>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref } from "vue";
import Grid, { nullCell } from "../grid/Grid";
import { Cell, Direction, Vec } from "../grid/types";
import EditGrid from "./EditGrid.vue";
import Suggestion from "./Suggestion.vue";
import Definition from "./Definition.vue";

const props = defineProps<{ grid: Grid }>();
const emit = defineEmits<{
  (event: "update", value: number): string;
}>();
const editor = ref(null);
const dir = ref<Direction>("horizontal");
const focus = ref<Vec>({ x: -1, y: -1 });
const suggestion = ref("");
const version = ref(0);

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
  props.grid.suggest([value], [focus.value], [dir.value]);
  refresh();
}
function onMouseEnter() {
  setTimeout(() => {
    props.grid.suggest([], [], []);
  }, 100);
}
function onClick(value: string) {
  props.grid.setWord(value, focus.value, dir.value);
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
</style>