<template>
  <svg
    viewBox="-1 -1 2 2"
    fill="none"
    class="icon"
    stroke="black" 
    stroke-width="0.1"  
    stroke-linecap="round" 
    :style="{transform: `${!dir.startsWith('right') ? 'rotate(-90deg)scale(-1, 1)translate(-50%,-50%)': 'translate(-50%,-50%)'}`}"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      v-if="dir === 'rightdown' || dir === 'downright'" 
      stroke="black" 
      stroke-width="0.1" 
      d="M 0 0 L 0.75 0 0.75 1 1 0.75 M 0.5 0.75 L 0.75 1"
    />
    <path
      v-else
      fill="none"
      d="M 0 0 L 0.9 0 0.75 0.25 M 0.75 -0.25 L 0.9 0"
    />
  </svg>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
import { ArrowDir } from "../grid/types";
// :style="{transform: `${dir.startsWith('right') ? 'rotate(-90deg)scale(-1, 1)': ''}`}"

const props = defineProps<{ width?: number; dir: ArrowDir }>();
</script>

<style>
</style>