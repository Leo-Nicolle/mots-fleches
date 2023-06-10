<template>
  <div ref="exporter" class="exporter">
    <n-button @click="print" round>{{$t('buttons.print')}}</n-button>
    <iframe class="print" :src="iframeUrl"></iframe>
  </div>
</template>

<script setup lang="ts">
import { defineProps, computed } from "vue";
import router from "../router";
/**
 * Component to print. It uses an iframe to print the page.
 *
 */
const props = defineProps<{
  /**
   * The route of the page to print
   */
  route: string;
  /**
   * The query of the route
   */
  query: any;
}>();

function print() {
  const iframe = document.querySelector("iframe.print") as HTMLIFrameElement;
  if (!iframe || !iframe.contentWindow) return;
  iframe.contentWindow.print();
}
const iframeUrl = computed(() => {
  const url = `${window.location.origin}${
    router.resolve({
      name: props.route,
      query: props.query,
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