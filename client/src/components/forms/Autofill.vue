<template>
  <div class="autofill">
    <n-auto-complete class="autofillinput" v-model:value="editingValue" :input-props="{
      autocomplete: 'enabled',
    }" :options="options" :placeholder="$t('forms.addWord')" @keyup="onKeyUp" />
    <div class="words scroll">
      <span class="autofillword" v-for="(word, i) in words" :key="word" @click="(i) => onDelete(i)">{{ word }}</span>
    </div>
  </div>
  <span class="run">
    <n-button :disabled="busy" @click="onRunClick">Run</n-button>
  </span>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { workerController } from "../../search-worker";
import throttle from "lodash.throttle";
import { Grid } from "grid";
const props = defineProps<{
  grid: Grid;
}>();
const editingValue = ref<string>('');
const options = ref([] as string[]);
const words = ref<string[]>([
  'BALEINE',
  'TOUCAN',
  'ZEBRE',
  'TORTUE',
  "CHAT",
  "CHIEN",
  "TIGRE",
  "LION",
  "AIGLE",
  "MOUETTE",
  "GOELAND",
  "URUBU",
  "ELEPHANT",
  "DAUPHIN",
  "POULPE",
  "REQUIN",
  "SCARABEE",
  "PAPILLON",
  "CHENILLE"
]);
const busy = ref(false);
function refreshGetSuggestions() {
  workerController.searchWord(editingValue.value);
}
function onDelete(index: number) {
  words.value.splice(index, 1);
}

const throttledSuggesttions = throttle(refreshGetSuggestions, 200);
watch(editingValue, (value, previous) => {
  if (value === previous) return;
  throttledSuggesttions();
});
function onKeyUp(evt: KeyboardEvent) {
  if (evt.code !== "Enter") return;
  if (words.value.find(w => w === editingValue.value)) return;
  words.value.push(editingValue.value);
  words.value.sort();
  editingValue.value = '';
}
function onRunClick() {
  busy.value = true;
  workerController.autofill(props.grid, words.value);
}
workerController.on('searchword-result', (words) => {
  options.value = words.map(w => ({
    label: w,
    value: w
  }));
});

workerController.on('autofill-result', (data) => {
  props.grid.copyFrom(data);
  busy.value = false;
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
  height: calc(100% - 25px);
  width: 100%;
  grid-template-rows: max-content auto;
}

.autofill>.autofillinput {
  max-width: 180px;
}

.autofill>.words {
  display: grid;
  grid-template-rows: repeat(auto-fill, 2.5em);
  margin: 5px 0 5px 5px;
  height: 100%;
  overflow-x: hidden;
  overflow-y: scroll;
  /* gap: 1rem; */
  align-items: flex-start;
  font-size: 1.2em;
}

.autofill>.words>span {
  cursor: pointer;
}

.autofill>.words>span:hover {
  text-decoration: underline;
  font-size: 1.3em;
}

.run {
  display: flex;
  width: 100%;
  position: sticky;
  bottom: 20px;
  z-index: 1000;
  background: #fff;
}

.run>button {
  width: 100%;
}
</style>