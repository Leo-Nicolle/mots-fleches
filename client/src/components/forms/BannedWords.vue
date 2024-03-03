<template>
  <section>
    <h3>{{ $t('forms.ban') }}</h3>
    <n-form inline>
      <n-form-item path="delete">
        <n-auto-complete v-model:value="value" :input-props="{
          autocomplete: 'enabled',
        }" :options="options" :placeholder="$t('forms.banword')" @keyup="onAddKeyup" />
      </n-form-item>
    </n-form>
    <h3>{{ $t("forms.bannedwords") }}</h3>
    <div class="words">
      <span v-for="word in words" :key="word" @click="() => unban(word)">
        {{ word }}
      </span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { defineProps, onMounted, ref, toRaw, watch } from "vue";
import throttle from "lodash.throttle";
import { api } from "../../api";
import { workerController } from "../../worker";
import { postEvent } from "../../js/telemetry";
/**
 * Component to add and delete words
 * Also has a list of all the words
 */
const value = ref<string>("");
const words = ref<string[]>([]);
const options = ref<string[]>([]);
const props = defineProps<{
  version?: number;
}>();
onMounted(() => {
  getWords();
});
watch(
  () => props.version,
  () => {
    getWords();
  }
);

watch(() => value.value, () => {
  throttledSearch();
});
workerController.on("searchword-result", (data) => {
  // busy.value = false;
  options.value = data
    .map(word => ({ label: word, value: word }));
});

function refreshWords() {
  // busy.value = true;
  if (value.value.length < 2) return;
  workerController.searchWord(value.value);
}
const throttledSearch = throttle(refreshWords, 50);

function getWords() {
  api.db.getBannedWords().then((ws) => {
    words.value = ws.sort((a, b) => a.localeCompare(b));
  });
}
function onAddKeyup(evt: KeyboardEvent) {
  if (evt.code !== "Enter") return;
  postEvent('ban-word');
  api.db.pushBannedWord(toRaw(value.value)).then(() => {
    getWords();
  });
}
function unban(word: string) {
  postEvent('unban-word');
  api.db.deleteBannedWord(word).then(() => {
    getWords();
  });
}

</script>

<style scoped>
.input {
  text-transform: uppercase;
}

.words {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  align-items: flex-start;
  gap: 10px;
  text-transform: uppercase;
  font-size: 1em;
}

.words>span {
  cursor: pointer;
}

.words>span:hover {
  text-decoration: underline;
}
</style>
../../worker