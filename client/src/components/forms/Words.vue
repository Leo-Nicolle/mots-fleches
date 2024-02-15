<template>
  <section>
    <n-form inline>
      <n-form-item :label="$t('forms.add')" path="add">
        <n-input v-model:value="value" :placeholder="$t('forms.addWord')" @keyup="onAddKeyup" />
      </n-form-item>
      <n-form-item :label="$t('forms.delete')" path="delete">
        <n-auto-complete v-model:value="value" :input-props="{
          autocomplete: 'enabled',
        }" :options="options" :placeholder="$t('forms.deleteWord')" @keyup="onDeleteKeyup" />
      </n-form-item>
    </n-form>
    <h3>{{ $t("forms.myWords") }}</h3>
    <div class="words">
      <span v-for="word in words" :key="word" @click="() => deleteWord(word)">
        {{ word }}
      </span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, defineProps, onMounted, ref, toRaw, watch } from "vue";
import { api } from "../../api";
/**
 * Component to add and delete words
 * Also has a list of all the words
 */
const value = ref<string>("");
const words = ref<string[]>([]);
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
function getWords() {
  api.db.getWords().then((ws) => {
    words.value = ws.sort((a, b) => a.localeCompare(b));
  });
}
function onAddKeyup(evt: KeyboardEvent) {
  if (evt.code !== "Enter") return;
  api.db.pushWord(toRaw(value.value)).then(() => {
    getWords();
  });
}
function onDeleteKeyup(evt: KeyboardEvent) {
  if (evt.code !== "Enter") return;
  api.db.deleteWord(toRaw(value.value)).then(() => {
    getWords();
  });
}
function deleteWord(word: string) {
  api.db.deleteWord(word).then(() => {
    getWords();
  });
}

const options = computed(() => {
  return words.value
    .filter((w) => w.startsWith(value.value))
    .map((suffix) => {
      return {
        label: suffix,
        value: suffix,
      };
    });
});
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
