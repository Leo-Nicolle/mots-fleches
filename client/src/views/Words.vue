<template>
  <Layout :breadcrumbs="[{ text: $t('nav.words') }]" :left-panel-width="300">
    <template v-slot:left-panel>
      <n-tabs v-model:value="mode" type="card">
        <n-tab-pane name="words" :tab="$t('forms.myWords')">
          <div class="left-panel">
            <n-button round @click="download"> {{ $t('buttons.download') }} </n-button>
            <UploadModal :title="$t('buttons.uploadWords')" :buttonText="$t('buttons.uploadWords')" @ok="onUpload" />
          </div>
        </n-tab-pane>
        <n-tab-pane name="bannedWords" :tab="$t('forms.bannedwords')">
        </n-tab-pane>
      </n-tabs>
    </template>
    <template #body>
      <div class="words-wrapper">
        <Words v-if="mode === 'words'" :version="version" />
        <BannedWords v-else-if="mode === 'bannedWords'" :version="version" />
      </div>
    </template>
  </Layout>
</template>

<script setup lang="ts">
import Layout from "../layouts/Main.vue";
import Words from "../components/forms/Words.vue";
import BannedWords from "../components/forms/BannedWords.vue";
import UploadModal from "../components/modals/UploadModal.vue";
import { api } from "../api";
import { ref } from "vue";
import { postEvent } from "../js/telemetry";
const mode = ref<'words' | 'bannedWords'>('words');
const version = ref(0);
function download() {
  postEvent("download-words");
  api.db.getWords().then((words) => {
    const a = document.createElement("a");
    const file = new Blob([JSON.stringify(words)], { type: "text/plain" });
    a.href = URL.createObjectURL(file);
    a.download = "words.json";
    a.click();
  });
}
function onUpload(filesContents: [string, string][]) {
  postEvent("upload-words");
  return Promise.all(
    filesContents.map(([filename, json]) => {
      return Promise.all(
        JSON.parse(json).map((word) => api.db.pushWord(word.trim()))
      );
    })
  )
    .then(() => version.value = version.value + 1);
}
</script>

<style scoped>
.words-wrapper {
  margin: 1em 0 0 1em;
}
</style>
