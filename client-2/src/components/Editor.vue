<template>
  <div ref="editor" class="editor" :version="version">
    <EditGrid :grid="grid" />

  </div>
</template>

<script setup lang="ts">
import { nextTick, reactive, Ref, ref } from "vue";
import Grid from "../js/Grid";
import { Cell, Direction, Vec } from "../js/types";
import EditGrid from './EditGrid.vue';
const editor = ref(null);
let dir: Direction = 'horizontal';
let version = ref(0);

const grid: Grid = new Grid(10,10);

function refresh(){
version.value++;
}
</script>

<style scoped>
</style>