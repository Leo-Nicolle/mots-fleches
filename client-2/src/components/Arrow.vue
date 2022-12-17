<template>
  <svg
    viewBox="-1 -1 2 2"
    fill="none"
    class="icon"
    :stroke="strokeColor"
    stroke-width="0.1"
    stroke-linecap="round"
    :style="{
      transform: `${
        !dir.startsWith('right')
          ? 'rotate(-90deg)scale(-1, 1)translate(-50%,-50%)'
          : 'translate(-50%,-50%)'
      }`,
    }"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path :d="getD(dir)" />
  </svg>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
import { ArrowDir } from "../grid/types";
// :style="{transform: `${dir.startsWith('right') ? 'rotate(-90deg)scale(-1, 1)': ''}`}"

const props = defineProps<{dir: ArrowDir, strokeColor: string }>();

function getD(dir: ArrowDir) {
  if (dir === "none") return "M 0 0.5 L 1 -0.5 M 0 -0.5 L 1 0.5 ";
  if (dir === "rightdown" || dir === "downright")
    return "M 0 0 L 0.75 0 0.75 1 1 0.75 M 0.5 0.75 L 0.75 1";
  return "M 0 0 L 0.9 0 0.75 0.25 M 0.75 -0.25 L 0.9 0";
}
</script>

<style>
</style>