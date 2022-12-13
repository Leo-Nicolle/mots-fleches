<template>
  <div class="defoptions">
    <n-button icon-placement="right" @click="onSplit">
      {{ cell.splited ? "unsplit" : "split" }}
    </n-button>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, reactive } from "vue";
import Arrow from "./Arrow";
import { ArrowDir, Cell, Vec } from "../grid/types";
import Grid from "../grid/Grid";

const version = ref(1);

const props = defineProps<{ cell: Cell; width: string }>();
const emit = defineEmits<{
  (event: "hover", value: string): void;
}>();
const data = reactive({
  cell: props.cell,
});

function onSplit() {
  Grid.setSplit(props.cell, !props.cell.splited);
  data.cell = props.cell;
  // refresh();
}

</script>

<style scoped>
.definition {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  width: 200px;
  height: 200px;
}
.separator {
  /* grid-area: 3 / 1 / 3 / 3; */
  position: relative;
  top: 50%;
  widows: 100%;
  background: black;
  height: 1px;
}
.definputs {
  display: flex;
  flex-direction: column;
  grid-area: 1 / 1 / 5 / 3;
}
.def {
  border: 0;
  display: grid;
  width: v-bind(width);
  height: v-bind(width);
  grid-template-rows: 25% 25% 25% 25%;
  grid-template-columns: 50% 50%;
  gap: 0px 0px;
  grid-auto-flow: row;
}
textarea {
  border: 0;
  outline: 0;
  padding: 0;
  margin: 0;
  text-align: center;
  text-anchor: start;
  max-width: 100%;
  height: 100%;
  resize: none;
  background: #aaa;
  line-height: calc(v-bind(width) / 4 - 1px);
  text-overflow: clip;
  overflow-wrap: anywhere;
  overflow: hidden;
}
textarea:focus {
  outline: 0;
  border: 0;
}
.arrow {
  height: 2em;
  width: 2em;
}
.handle {
  position: relative;
  cursor: pointer;
  padding: 4px;
  height: 0;
  width: 0;
  border: 0;
  border-radius: 50%;
  z-index: 100;
  background: #333;
  transform: translate(-50%, -50%);
}
.n-icon svg {
  width: 100%;
  height: 100%;
}
.n-icon-slot i {
  transform: translate(50%, 45%);
}
img {
  width: 100%;
}
</style>