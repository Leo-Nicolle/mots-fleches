<template>
  <Layout v-if="fonts" :breadcrumbs="[{ text: $t('nav.fonts') }]" :eltList="fonts" :onDelete="onDelete"
    @select="(s) => (selected = s)" :has-create-button="false" :has-delete-button="true">
    <template v-slot:left-panel>
      <UploadModal :title="$t('titles.newFont')" :buttonText="$t('buttons.create')" :readAsDataURL="true" :single="true"
        @ok="onUpload" />
    </template>
    <template #card-title="{ elt }">
      <FontLoader :value="elt" />
      <span class="font-body" :style="{ 'font-family': elt.family }">
        {{ elt.family }}
      </span>
    </template>
  </Layout>
</template>

<script setup lang="ts">
import Layout from "../layouts/GridLayout.vue";
import UploadModal from "../components/modals/UploadModal.vue";
import FontLoader from "../components/fonts/FontLoader.vue";

import { v4 as uuid } from "uuid";
import { api } from "../api";
import { onMounted, ref } from "vue";
import { Font } from "database";
import { loadFont } from "../components/fonts/load-font";
import { postEvent } from "../js/telemetry";

const fonts = ref<Font[]>([]);
const selected = ref<Font[]>([]);
onMounted(() => {
  getFonts();
});
function getFonts() {
  return api.db.getFonts().then((fs) => {
    fonts.value = fs
      .sort((a, b) => a.updated - b.updated)
      .map((f) => ({ ...f, name: f.name ? f.name : "unamed" }));
    return Promise.all(fonts.value.map((font) => loadFont(font)));
  });
}
function onUpload(filesContents: [string, string][]) {
  postEvent("create-font");
  return Promise.all(
    filesContents.map(([filename, dataURL]) => {
      const family = filename
        .replace(/\..*/, "")
        .replace(/[^\w]/gi, "")
        .replace(/[0-9]+/gi, "");
      return api.db.pushFont({
        family,
        updated: Date.now(),
        content: dataURL,
      });
    })
  ).then(() => getFonts());
}
function onDelete() {
  return Promise.all(
    selected.value.map((font) => api.db.deleteFont(font.id))
  ).then(() => getFonts());
}
</script>

<style>
.n-card:has(.font-body) {
  height: 75px;
}

.font-body {
  grid-column: 1 / 3;
  text-align: center;
}
</style>
