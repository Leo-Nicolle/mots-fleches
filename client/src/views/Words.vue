<template>
  <Layout>
    <template #body>
      <Words v-if="mode === 'words'" :version="version" />
      <BannedWords v-else-if="mode === 'bannedwords'" :version="version" />
    </template>
    <template v-slot:left-panel>
      <h3>
        <n-button @click="nextMode">
          {{ mode === 'words' ? $t('forms.myWords') : $t('forms.bannedwords') }}
        </n-button>
      </h3>
      <n-button v-if="buttons.includes('download')" round @click="download"> {{ $t('buttons.download') }} </n-button>
      <UploadModal v-if="buttons.includes('uploadWords')" :title="$t('buttons.uploadWords')"
        :buttonText="$t('buttons.uploadWords')" @ok="onUpload" />
    </template>
  </Layout>
</template>

<script setup lang="ts">
import Layout from "../layouts/Main.vue";
import Words from "../components/forms/Words.vue";
import BannedWords from "../components/forms/BannedWords.vue";
import UploadModal from "../components/modals/UploadModal.vue";
import { api } from "../api";
import { computed, ref } from "vue";
const modes = ['words', 'bannedwords'];
const mode = ref(modes[1]);
const version = ref(0);
const buttons = computed(() => {
  return mode.value === 'words'
    ? ['download', 'uploadWords']
    : '';
});
function download() {
  api.db.getWords().then((words) => {
    const a = document.createElement("a");
    const file = new Blob([JSON.stringify(words)], { type: "text/plain" });
    a.href = URL.createObjectURL(file);
    a.download = "words.json";
    a.click();
  });
}
function nextMode() {
  const index = modes.indexOf(mode.value);
  mode.value = modes[(index + 1) % modes.length];
}
function onUpload(filesContents: [string, string][]) {
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

<style scoped></style>

