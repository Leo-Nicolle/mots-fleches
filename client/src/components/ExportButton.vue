<template>
  <div ref="exporter" class="exporter">
    <n-button @click="print" round>{{ $t('buttons.print') }}</n-button>
    <iframe ref="iframe" class="print" :src="iframeUrl"></iframe>
  </div>
</template>

<script setup lang="ts">
import { defineProps, computed, ref, onMounted } from "vue";
import router from "../router";
import { postEvent } from "../js/telemetry";
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
const enabled = ref<boolean>(false);
const iframe = ref<HTMLIFrameElement>();
const shouldPrint = ref(false);
function print() {
  enabled.value = true;
  shouldPrint.value = true;
}
const iframeUrl = computed(() => {
  const url = `${window.location.origin}${router.resolve({
    name: props.route,
    query: { ...props.query, enabled: enabled.value },
  }).href
    }`;
  return url;
});
onMounted(() => {
  window.addEventListener("message", ({ data }) => {
    if (data === 'print-ready' && shouldPrint.value) {
      const iframe = document.querySelector("iframe.print") as HTMLIFrameElement;
      if (!iframe || !iframe.contentWindow) return;
      shouldPrint.value = false;
      iframe.contentWindow.postMessage('print', '*');
    }
    else if (data === 'print-done') {
      postEvent("print", {
        props: {
          length: props.query.ids.split(',').length,
          route: props.route,
        }
      });
      enabled.value = false;
    }
  });
});
</script>

<style scoped>
.exporter>iframe {
  position: fixed;
  top: 100%;
}
</style>