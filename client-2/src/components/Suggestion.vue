<template>
  <div ref="suggestion" class="suggestion" :version="version">

  </div>
</template>

<script setup lang="ts">
import { nextTick, reactive, Ref, ref } from "vue";
import axios from 'axios';
import Grid from "../js/Grid";
import { Cell, Direction, Vec } from "../js/types";
const suggestion = ref(null);
let dir: Direction = 'horizontal';
let version = ref(0);

const grid: Grid = new Grid(10,10);

function refresh(){
version.value++;
}
</script>

<style scoped>
</style>