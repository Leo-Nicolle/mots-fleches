<template>
  <div ref="exporter" class="exporter">
    <n-button @click="print">Imprimer</n-button>
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
  console.log(
    router.currentRoute.value.path,
    router.currentRoute.value.fullPath,
    router.currentRoute.value.meta,
  )
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
/* Targets all the pages */
.exporter > button {
  position: fixed;
  top: 10px;
  left: 10px;
}
.exporter > iframe {
  position: fixed;
  top: 100%;
}
</style>