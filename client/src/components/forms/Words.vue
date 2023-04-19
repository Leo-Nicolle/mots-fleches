<template>
  <section>
    <n-form inline>
      <n-form-item :label="$t('forms.add')" path="add">
        <n-auto-complete
          v-model:value="value"
          :input-props="{
            autocomplete: 'enabled',
          }"
          :options="options"
          :placeholder="$t('forms.addWord')"
          @keyup="onAddKeyup"
        />
      </n-form-item>
      <n-form-item :label="$t('forms.delete')" path="delete">
        <n-auto-complete
          v-model:value="value"
          :input-props="{
            autocomplete: 'enabled',
          }"
          :options="options"
          :placeholder="$t('forms.deleteWord')"
          @keyup="onDeleteKeyup"
        />
      </n-form-item>
    </n-form>
    <h3>{{ $t('forms.myWords') }}</h3>
    <div class="words">
      <span v-for="word in words" :key="word">
        {{ word }}
      </span>
    </div>
  </section>
</template>

<script setup lang="ts">
import axios from "axios";
import { computed, onMounted, ref } from "vue";
import { getUrl } from "../../js/utils";
/**
 * Component to add and delete words
 * Also has a list of all the words
 */
const value = ref<string>("");
const words = ref<string[]>([]);
onMounted(() => {
  getWords();
});
function getWords() {
  axios.get(getUrl("word")).then(({ data }) => {
    words.value = data.sort((a, b) => a.localeCompare(b));
  });
}
function onAddKeyup(evt: KeyboardEvent) {
  if (evt.code !== "Enter") return;
  axios.post(getUrl("word"), { word: value.value }).then(() => {
    getWords();
  });
}
function onDeleteKeyup(evt: KeyboardEvent) {
  if (evt.code !== "Enter") return;
  axios.delete(getUrl(`word/${value.value}`)).then(() => {
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

<style>
.input {
  text-transform: uppercase;
}
.words{
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  align-items: flex-start;
  gap: 10px;
  text-transform: uppercase;
  font-size: 1em;
}
</style>
