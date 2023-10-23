<template>
  <Layout
    v-if="fonts"
    :eltList="fonts"
    :onDelete="onDelete"
    @select="(s) => (selected = s)"
    :has-create-button="false"
    :has-delete-button="true"
  >
    <template #body>
      <Fonts :version="version" />
    </template>
    <template v-slot:left-panel>
      <UploadModal
        :title="$t('buttons.newfont')"
        :buttonText="$t('buttons.new')"
        :readAsDataURL="true"
        :single="true"
        @ok="onUpload"
      />
    </template>
    <template #card-title="{ elt }">
      <span class="font-body" :style="{ 'font-family': elt.name }">
        {{ elt.name }}
      </span>
    </template>
    <template #card-body="{ elt, i }"> </template>
  </Layout>
</template>

<script setup lang="ts">
import Layout from "../layouts/GridLayout.vue";
import Fonts from "../components/fonts/Fonts.vue";
import UploadModal from "../components/UploadModal.vue";
import { v4 as uuid } from "uuid";
import { api } from "../api";
import { onMounted, ref } from "vue";
import { Font } from "database";

const fonts = ref<Font[]>([]);
const selected = ref<Font[]>([]);

const version = ref(0);
onMounted(() => {
  getFonts();
});
function getFonts() {
  return api.db.getFonts().then((fs) => {
    fonts.value = fs
      .sort((a, b) => a.updated - b.updated)
      .map((f) => ({ ...f, name: f.name ? f.name : "unamed" }));
    return Promise.all(
      fonts.value.map((font) => {
        const fontface = new FontFace(font.name, `url(${font.content})`);
        return fontface.load();
      })
    ).then((fontfaces) => {
      console.log({ fontfaces });
      fontfaces.forEach((fontface) => {
        document.fonts.add(fontface);
      });
    });
  });
}
function onUpload(filesContents: [string, string][]) {
  return Promise.all(
    filesContents.map(([filename, dataURL]) => {
      const name = filename.replace(/\..*/, "").replace(/[^\w\s]/gi, "");
      return api.db.pushFont({
        id: uuid(),
        name,
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
  text-align: center;
}
</style>

