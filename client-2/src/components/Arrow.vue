<template>
  <svg
    viewBox="-100 -100 200 200"
    fill="none"
    class="icon"
    :stroke="strokeColor"
    stroke-width="10"
    stroke-linecap="round"
    :style="{
      transform: transform,
    }"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path :d="getD(dir)" />
  </svg>
</template>

<script setup lang="ts">
import { defineProps, computed } from "vue";
import { ArrowDir } from "grid";
// :style="{transform: `${dir.startsWith('right') ? 'rotate(-90deg)scale(-1, 1)': ''}`}"

const props =
  defineProps<{ dir: ArrowDir; strokeColor: string; center: boolean }>();
function getTranform() {
 
}
let transform = computed<string>(() => {
  const translate = props.center ? `translate(-50%,-50%)` : `translate(0,0)`;
  if (props.dir.startsWith("right")) {
    return `rotate(180deg)scale(-1, -1)${translate}`;
  }
  return `scale(-1,1)rotate(90deg)${translate}`;
});
function getD(dir: ArrowDir) {
  if (dir === "none") return "M 0 50 L 100 -50 M 0 -50 L 100 50";
  if (dir === "rightdown" || dir === "downright")
    return "M 0 0 L 75 0 75 100 100 75 M 50 75 L 75 100";
  return "M 0 0 L 90 0 75 25 M 75 -25 L 90 0";
}
</script>

<style>
</style>