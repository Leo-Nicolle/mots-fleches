<template>
  <div class="autofill">
    <n-auto-complete class="autofillinput" v-model:value="editingValue" :input-props="{
      autocomplete: 'enabled',
    }" :options="options" :placeholder="$t('forms.addWord')" @keyup="onKeyUp" />
    <div class="words scroll">
      <span class="autofillword" v-for="(word, i) in words" :key="word" @click="(i) => onDelete(i)">{{ word }}</span>
    </div>
    <n-button @click="onRunClick">Run</n-button>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, computed, watchEffect, onMounted, watch } from "vue";
import { useModel } from "../../js/useModel";
import { Format } from "grid";
import MarginForm from "./MarginForm.vue";
import { dico } from "../../search-worker/dico";
import { workerController } from "../../search-worker";
import throttle from "lodash.throttle";

/**
 * Form to edit paper format and margins
 */

// const props = defineProps<{
//   /** The format to edit */
//   modelValue: string;
// }>();
// const emit = defineEmits<{
//   /** v-model event
//    * @param value The new format
//    */
//   (event: "update:modelValue", value: string[]): void;
// }>();
const editingValue = ref<string>('');
const options = ref([] as string[]);
const words = ref<string[]>([]);
function refreshGetSuggestions() {
  workerController.searchWord(editingValue.value);
}
function onDelete(index: number) {
  words.value.splice(index, 1);
}

const throttledAutofill = throttle(refreshGetSuggestions, 200);
watch(editingValue, (value, previous) => {
  if (value === previous) return;
  throttledAutofill();
});
function onKeyUp(evt: KeyboardEvent) {
  if (evt.code !== "Enter") return;
  if (words.value.find(w => w === editingValue.value)) return;
  words.value.push(editingValue.value);
  editingValue.value = '';
  // throttledAutofill();
}

workerController.on('searchword-result', (words) => {
  options.value = words.map(w => ({
    label: w,
    value: w
  }));
});
onMounted(() => {
  // console.log('onMounted');
  // getOptions();
});
</script>

<style scoped>
.autofill {
  margin: 10px 0;
  gap: 5px;
  display: grid;
  height: 100%;
  grid-template-rows: max-content auto max-content;
}

.autofill>.autofillinput {
  max-width: 180px;
}

.autofill>.words {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-x: hidden;
  overflow-y: scroll;
  gap: 2px;
}

.autofill>.words>span {
  cursor: pointer;
}

.autofill>.words>span:hover {
  text-decoration: underline;
  font-size: 16px;
}
</style>