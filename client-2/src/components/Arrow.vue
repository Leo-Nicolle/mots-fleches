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
import {getD, getTransform} from "../js/paths";

const props = defineProps<{ dir: ArrowDir; strokeColor: string; center: boolean }>();
let transform = computed<string>(() => getTransform(props.dir));
</script>

<style>
</style>