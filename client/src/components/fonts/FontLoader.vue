<template>
  <link v-if="value.isGoogle && url" :href="url" rel="stylesheet" />
</template>

<script setup lang="ts">
import { defineProps, ref } from "vue";
import { watch } from "vue";
import { loadFont } from "./load-font";
import axios from "axios";
import { Font, isGoogleFont } from "grid";

const props = defineProps<{
  value: Font;
  // TODO: generate <font> tag with data64 font for SVG export.
  isEmbedded?: boolean;
}>();
const url = ref<string | null>(null);
watch([props], () => {
  const { value } = props;
  if (isGoogleFont(value)) {
    let weightUrl = `https://fonts.googleapis.com/css?family=${value.family}:${value.weight}`;
    let simpletUrl = `https://fonts.googleapis.com/css?family=${value.family}`;
    return axios
      .get(weightUrl)
      .then(() => {
        url.value = weightUrl;
      })
      .catch(() => {
        url.value = simpletUrl;
      });
  }
  url.value = null;
  loadFont(value);
});
</script>

<style>
</style>
