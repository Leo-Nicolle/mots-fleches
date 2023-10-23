<template>
  <link
    v-if="value.isGoogle"
    :href="`https://fonts.googleapis.com/css?family=${value.family}:${value.weight}`"
    rel="stylesheet"
  />
</template>

<script setup lang="ts">
import { Font } from "database";
import { watch } from "vue";
import { loadFont } from "./load-font";

const props = defineProps<{
  value: Font & {
    isGoogle: boolean;
  };
}>();

watch([props.value], () => {
  if (!props.value.isGoogle) return;
  loadFont(props.value);
});
</script>

<style>
</style>
