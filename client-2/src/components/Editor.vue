<template>
  <div ref="editor" class="editor" :version="version">
    <Suggestion
      :point="focus"
      :query="''"
      :grid-id="grid.id"
      @hover="(v) => onHover(v)"
      @focus="(point: Vec) => (focus = point)"
    ></Suggestion>
    <EditGrid @type="onType" :grid="props.grid" :suggestion="suggestion" />
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref } from "vue";
import Grid, { nullCell } from "../grid/Grid";
import { Cell, Direction, Vec } from "../grid/types";
import EditGrid from "./EditGrid.vue";
import Suggestion from "./Suggestion.vue";

const props = defineProps<{ grid: Grid }>();
const emit = defineEmits<{
  (event: "update", value: number): string;
}>();
const editor = ref(null);
let dir: Direction = "horizontal";
let focus = ref({ x: -1, y: -1 });
let suggestion = ref("");
let version = ref(0);

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
  props.grid.suggest([value], [{ x: 0, y: 0 }], ["horizontal"]);
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