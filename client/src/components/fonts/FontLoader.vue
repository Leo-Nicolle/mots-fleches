<template>
  <link
    v-if="value.isGoogle"
    :href="`https://fonts.googleapis.com/css?family=${value.family}:${value.weight}`"
    rel="stylesheet"
  />
</template>

<script setup lang="ts">
import { defineProps } from "vue";
import { Font } from "database";
import { watch } from "vue";
import { loadFont } from "./load-font";

const props = defineProps<{
  value: Font & {
    isGoogle: boolean;
  },
  // TODO: generate <font> tag with data64 font for SVG export.
  isEmbedded?: boolean
}>();

watch([props.value], () => {
  if (!props.value.isGoogle) return;
  loadFont(props.value);
});
</script>

<style>
</style>
