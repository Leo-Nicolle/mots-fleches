<template>
  <Layout>
    <template #body>
      <Words :version="version" />
    </template>
    <template v-slot:left-panel>
      <n-button round @click="download"> {{ $t('buttons.download') }} </n-button>
      <UploadModal
        :title="$t('buttons.uploadWords')"
        :buttonText="$t('buttons.uploadWords')"
        @ok="onUpload"
      />
    </template>
  </Layout>
</template>

<script setup lang="ts">
import Layout from "../layouts/Main.vue";
import Words from "../components/forms/Words.vue";
import UploadModal from "../components/UploadModal.vue";
import { api } from "../api";
import {ref} from "vue";

const version = ref(0);
function download() {
  api.db.getWords().then((words) => {
    const a = document.createElement("a");
    const file = new Blob([JSON.stringify(words)], { type: "text/plain" });
    a.href = URL.createObjectURL(file);
    a.download = "words.json";
    a.click();
  });
}
function onUpload(filesContents: string[]) {
  return Promise.all(
    filesContents.map((json) => {
      return Promise.all(
        JSON.parse(json).map((word) => api.db.pushWord(word.trim()))
      );
    })
  )
  .then(() => version.value = version.value + 1);
}
</script>

<style scoped>
</style>

