<template>
  <div ref="exporter" class="exporter">
    <n-button @click="print" round>Imprimer</n-button>
    <iframe class="print" :src="iframeUrl"></iframe>
  </div>
</template>

<script setup lang="ts">
import { defineProps, computed } from "vue";
import router from "../router";

const props = defineProps<{ route: string, params: any }>();

function print() {
  const iframe = document.querySelector(".print");
  iframe.contentWindow.print();
}
const iframeUrl = computed(() => {
  const url =  `${window.location.origin}${
    router.resolve({
      name: props.route,
      params: props.params,
    }).href
  }`;
  return url;
});
</script>

<style scoped>
.exporter > iframe {
  position: fixed;
  top: 100%;
}
</style>